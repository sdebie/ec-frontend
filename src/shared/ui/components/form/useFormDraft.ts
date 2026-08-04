import {useCallback, useEffect, useRef} from 'react'
import type {FieldValues, UseFormReset, UseFormWatch} from 'react-hook-form'

/**
 * Keeps a react-hook-form's in-progress values in `sessionStorage`, so a page
 * reload does not throw away what someone has typed.
 *
 * WHY THIS EXISTS: form state lives only in memory, so any reload starts the
 * form over blank. That is not hypothetical — the mobile site reloads whenever
 * a phone returns from another app, and "go and look something up" (a VAT
 * number, a company registration number, a delivery address) is exactly what
 * takes someone out of the browser mid-form. They came back to step 1 of five.
 *
 * ## Why sessionStorage, not localStorage
 *
 * These forms carry personal data and company registration/VAT numbers. Session
 * storage survives every reload — including an OS tab-restore, which is the case
 * we are actually fixing — but is gone the moment the tab closes, so nothing is
 * left behind on a shared or public device. It is also per-tab, so two tabs
 * filling the same form never overwrite each other. (Owner decision 2026-08-04;
 * a days-long localStorage draft was the alternative and was declined.)
 *
 * ## Contract
 *
 * - `watch` and `reset` are taken individually rather than the whole
 *   `UseFormReturn` — the signature is then the honest list of what this touches
 *   (law 14). It reads values and restores them; it never submits or validates.
 * - Restoring happens once, on mount, BEFORE the first save can run. Until that
 *   has happened nothing is written, or an empty initial render would overwrite
 *   the very draft it is about to restore.
 * - A pristine form writes nothing, so merely visiting a page leaves no trace.
 * - `clearDraft` is the caller's to invoke on a successful submit. It is not
 *   automatic: only the caller knows the submission actually succeeded.
 * - Storage failures and unparseable drafts are swallowed. A draft is a
 *   convenience; it must never be able to break the form it is helping. Safari's
 *   private mode throws on `sessionStorage.setItem`, and a draft written before a
 *   schema change may no longer fit the form.
 */

/** Bumped when the stored shape changes, so old drafts are ignored, not misread. */
const DRAFT_VERSION = 1

/**
 * Discards a draft from outside the form that owns it.
 *
 * Checkout needs this: the form is submitted on one page but only CONFIRMED on
 * another (and via an off-site gateway round-trip in between), so the component
 * holding the hook is long gone by the time the draft has earned its deletion.
 */
export function clearFormDraft(storageKey: string): void {
    try {
        sessionStorage.removeItem(storageKey)
    } catch {
        // Storage unavailable — there was nothing persisted to clear.
    }
}

interface StoredDraft<TValues, TMeta> {
    version: number
    values: TValues
    meta?: TMeta
}

interface UseFormDraftArgs<TValues extends FieldValues, TMeta> {
    /** sessionStorage key. Namespaced per form, e.g. `ec_draft_wholesale`. */
    storageKey: string
    watch: UseFormWatch<TValues>
    reset: UseFormReset<TValues>
    /**
     * Caller state saved beside the values — the wholesale wizard's step, so a
     * restored applicant lands back where they were rather than on step 1 with
     * their answers mysteriously already filled in.
     */
    meta?: TMeta
    /** Receives the restored meta once, on mount, if a draft was found. */
    onRestoreMeta?: (meta: TMeta) => void
    /** Quiet period after the last keystroke before writing. */
    debounceMs?: number
}

export function useFormDraft<TValues extends FieldValues, TMeta = never>({
                                                                             storageKey,
                                                                             watch,
                                                                             reset,
                                                                             meta,
                                                                             onRestoreMeta,
                                                                             debounceMs = 400,
                                                                         }: UseFormDraftArgs<TValues, TMeta>): { clearDraft: () => void } {
    const hasRestored = useRef(false)

    // Held in refs so changing them cannot re-run the restore or re-subscribe the
    // watcher: `meta` changes on every wizard step, and `onRestoreMeta` is
    // typically an inline arrow.
    //
    // Assigned in effects, not during render — a render-phase ref write is not
    // safe under the React Compiler (it can be discarded with the render). After
    // commit is soon enough: both are only read later, from a save or a restore.
    const metaRef = useRef(meta)
    useEffect(() => {
        metaRef.current = meta
    }, [meta])

    const onRestoreMetaRef = useRef(onRestoreMeta)
    useEffect(() => {
        onRestoreMetaRef.current = onRestoreMeta
    }, [onRestoreMeta])

    const clearDraft = useCallback(() => clearFormDraft(storageKey), [storageKey])

    // Restore. Runs before the save effect below subscribes, so the first thing
    // that happens to a draft is being read, never being overwritten.
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(storageKey)
            if (raw) {
                const draft = JSON.parse(raw) as StoredDraft<TValues, TMeta>
                if (draft?.version === DRAFT_VERSION && draft.values) {
                    // keepDefaultValues: a later `reset()` by the form itself must
                    // still return to the ORIGINAL defaults, not to this draft.
                    reset(draft.values, {keepDefaultValues: true})
                    if (draft.meta !== undefined) onRestoreMetaRef.current?.(draft.meta)
                }
            }
        } catch {
            // Unreadable or stale-shaped draft — start clean rather than fail.
            clearDraft()
        } finally {
            hasRestored.current = true
        }
    }, [storageKey, reset, clearDraft])

    // Save: debounced while typing, and flushed immediately when the page is
    // about to be hidden or torn down.
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined

        const save = (values: FieldValues) => {
            // A form nobody has touched leaves no trace. `watch` fires on
            // programmatic prefills too, so this is what keeps a passive visit
            // from writing anything.
            if (!hasAnyValue(values)) {
                clearDraft()
                return
            }
            try {
                const draft: StoredDraft<FieldValues, TMeta> = {
                    version: DRAFT_VERSION,
                    values,
                    ...(metaRef.current !== undefined ? {meta: metaRef.current} : {}),
                }
                sessionStorage.setItem(storageKey, JSON.stringify(draft))
            } catch {
                // Quota exceeded or private mode — losing the draft is
                // acceptable; breaking the form is not.
            }
        }

        const subscription = watch((values) => {
            if (!hasRestored.current) return
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => save(values), debounceMs)
        })

        /*
          Write the pending value out NOW rather than waiting for the timer.

          This is the case the whole feature exists for and the debounce would
          otherwise lose: someone types a value, immediately switches apps to go
          and check something, and the page is reloaded on their return. The last
          keystrokes were still sitting in the timer, and backgrounding cancels
          it. `visibilitychange` fires on the app switch itself and `pagehide` on
          the teardown, so whichever comes first captures them.

          `watch()` with no arguments reads the CURRENT values, so this never
          writes the stale snapshot the pending timer was holding.
        */
        const flush = () => {
            if (!hasRestored.current) return
            if (timer) clearTimeout(timer)
            save(watch())
        }
        const flushIfHiding = () => {
            if (document.visibilityState === 'hidden') flush()
        }

        document.addEventListener('visibilitychange', flushIfHiding)
        window.addEventListener('pagehide', flush)

        return () => {
            document.removeEventListener('visibilitychange', flushIfHiding)
            window.removeEventListener('pagehide', flush)
            if (timer) clearTimeout(timer)
            subscription.unsubscribe()
        }
    }, [watch, storageKey, debounceMs, clearDraft])

    return {clearDraft}
}

/**
 * True when the shopper has actually entered something.
 *
 * Booleans are ignored on purpose: every checkbox has a default (the wholesale
 * form's `sameAsPhysical` defaults to true), so counting them would make an
 * untouched form look filled in and persist it on first render.
 */
function hasAnyValue(values: unknown): boolean {
    if (values == null) return false
    if (typeof values === 'string') return values.trim() !== ''
    if (typeof values === 'number') return true
    if (typeof values === 'boolean') return false
    if (Array.isArray(values)) return values.some(hasAnyValue)
    if (typeof values === 'object') return Object.values(values as Record<string, unknown>).some(hasAnyValue)
    return false
}
