import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {useForm} from 'react-hook-form'
import {clearFormDraft, useFormDraft} from '../useFormDraft'

/**
 * Form values live only in memory, so any reload starts a form over blank. On
 * the mobile site a reload is exactly what happens when someone leaves the
 * browser to look something up mid-form — a VAT number, a delivery address —
 * and they came back to an empty form.
 *
 * A remount with the same storage key is what a reload looks like from a
 * component's point of view: fresh state, same sessionStorage. That is what
 * these drive.
 */

const KEY = 'test_draft'

interface Values {
    firstName: string
    company: string
    subscribed: boolean
}

function DraftForm({meta, onRestoreMeta, debounceMs = 10}: {
    meta?: number
    onRestoreMeta?: (m: number) => void
    debounceMs?: number
}) {
    const {register, watch, reset} = useForm<Values>({
        defaultValues: {firstName: '', company: '', subscribed: true},
    })
    const {clearDraft} = useFormDraft<Values, number>({
        storageKey: KEY,
        watch,
        reset,
        meta,
        onRestoreMeta,
        debounceMs,
    })

    return (
        <form>
            <label htmlFor="firstName">First name</label>
            <input id="firstName" {...register('firstName')} />
            <label htmlFor="company">Company</label>
            <input id="company" {...register('company')} />
            <button type="button" onClick={clearDraft}>Clear draft</button>
        </form>
    )
}

function readDraft() {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
}

describe('useFormDraft', () => {
    beforeEach(() => sessionStorage.clear())
    afterEach(() => sessionStorage.clear())

    it('restores typed values after a remount — the reload case this exists for', async () => {
        const user = userEvent.setup()
        const {unmount} = render(<DraftForm/>)

        await user.type(screen.getByLabelText('First name'), 'Vanessa')
        await user.type(screen.getByLabelText('Company'), 'UVH Holdings')
        await waitFor(() => expect(readDraft()?.values).toMatchObject({
            firstName: 'Vanessa',
            company: 'UVH Holdings',
        }))

        unmount()
        render(<DraftForm/>)

        await waitFor(() => expect(screen.getByLabelText('First name')).toHaveValue('Vanessa'))
        expect(screen.getByLabelText('Company')).toHaveValue('UVH Holdings')
    })

    it('restores caller meta, so the wizard reopens on the step it was left on', async () => {
        const user = userEvent.setup()
        const {unmount} = render(<DraftForm meta={2}/>)

        await user.type(screen.getByLabelText('First name'), 'Vanessa')
        await waitFor(() => expect(readDraft()?.meta).toBe(2))

        unmount()
        const restored: number[] = []
        render(<DraftForm onRestoreMeta={(m) => restored.push(m)}/>)

        await waitFor(() => expect(restored).toEqual([2]))
    })

    /*
      The debounce alone loses the very case this feature is for: type a value,
      switch apps immediately, come back to a reloaded page. Backgrounding
      cancels the pending timer, so the last keystrokes never reached storage.
      Caught while writing these tests, not in review.
    */
    it('flushes pending keystrokes when the app is backgrounded, without waiting for the debounce', async () => {
        const user = userEvent.setup()
        render(<DraftForm debounceMs={100_000}/>)

        await user.type(screen.getByLabelText('First name'), 'Vanessa')
        expect(sessionStorage.getItem(KEY)).toBeNull() // still only in the timer

        // The app switch itself.
        Object.defineProperty(document, 'visibilityState', {value: 'hidden', configurable: true})
        document.dispatchEvent(new Event('visibilitychange'))

        expect(readDraft()?.values.firstName).toBe('Vanessa')
        Object.defineProperty(document, 'visibilityState', {value: 'visible', configurable: true})
    })

    it('flushes on pagehide too, for a teardown that never reports hidden', async () => {
        const user = userEvent.setup()
        render(<DraftForm debounceMs={100_000}/>)

        await user.type(screen.getByLabelText('Company'), 'UVH Holdings')
        expect(sessionStorage.getItem(KEY)).toBeNull()

        window.dispatchEvent(new Event('pagehide'))

        expect(readDraft()?.values.company).toBe('UVH Holdings')
    })

    it('does not write on becoming visible again — only on the way out', async () => {
        const user = userEvent.setup()
        render(<DraftForm debounceMs={100_000}/>)

        await user.type(screen.getByLabelText('First name'), 'Vanessa')
        document.dispatchEvent(new Event('visibilitychange')) // still 'visible'

        expect(sessionStorage.getItem(KEY)).toBeNull()
    })

    it('writes nothing for a form nobody has typed into', async () => {
        render(<DraftForm/>)
        // Long enough to outlast the debounce several times over.
        await new Promise((resolve) => setTimeout(resolve, 120))
        expect(sessionStorage.getItem(KEY)).toBeNull()
    })

    it('does not count a defaulted checkbox as input', async () => {
        // `subscribed` defaults to true. If booleans counted, merely opening the
        // page would persist a "draft" of the defaults — the wholesale form's
        // sameAsPhysical made this a live hazard, not a hypothetical one.
        render(<DraftForm/>)
        await new Promise((resolve) => setTimeout(resolve, 120))
        expect(sessionStorage.getItem(KEY)).toBeNull()
    })

    it('clearDraft removes it, and a remount then starts blank', async () => {
        const user = userEvent.setup()
        const {unmount} = render(<DraftForm/>)

        await user.type(screen.getByLabelText('First name'), 'Vanessa')
        await waitFor(() => expect(readDraft()).not.toBeNull())

        await user.click(screen.getByRole('button', {name: 'Clear draft'}))
        expect(sessionStorage.getItem(KEY)).toBeNull()

        unmount()
        render(<DraftForm/>)
        await new Promise((resolve) => setTimeout(resolve, 60))
        expect(screen.getByLabelText('First name')).toHaveValue('')
    })

    it('keeps the draft out of localStorage — it must not outlive the tab', async () => {
        const user = userEvent.setup()
        render(<DraftForm/>)

        await user.type(screen.getByLabelText('First name'), 'Vanessa')
        await waitFor(() => expect(readDraft()).not.toBeNull())

        expect(Object.keys(localStorage)).not.toContain(KEY)
    })

    it('ignores a draft written by an older shape instead of half-restoring it', async () => {
        sessionStorage.setItem(KEY, JSON.stringify({version: 0, values: {firstName: 'Stale'}}))
        render(<DraftForm/>)

        await new Promise((resolve) => setTimeout(resolve, 60))
        expect(screen.getByLabelText('First name')).toHaveValue('')
    })

    it('survives an unparseable draft rather than taking the form down with it', async () => {
        sessionStorage.setItem(KEY, 'not json{')
        render(<DraftForm/>)

        // The form still renders and is usable — a draft is a convenience and
        // must never be able to break the thing it is helping.
        expect(screen.getByLabelText('First name')).toHaveValue('')
        const user = userEvent.setup()
        await user.type(screen.getByLabelText('First name'), 'Vanessa')
        expect(screen.getByLabelText('First name')).toHaveValue('Vanessa')
    })

    it('clearFormDraft works from outside the form — checkout clears on the success page', async () => {
        const user = userEvent.setup()
        render(<DraftForm/>)

        await user.type(screen.getByLabelText('First name'), 'Vanessa')
        await waitFor(() => expect(readDraft()).not.toBeNull())

        clearFormDraft(KEY)
        expect(sessionStorage.getItem(KEY)).toBeNull()
    })
})
