import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Invariants for the admin palette, checked against `index.css` itself.
 *
 * jsdom does not run the cascade for custom properties (`getComputedStyle` returns
 * '' for a `--x` an ancestor declared), so these parse the stylesheet rather than
 * pretending to resolve it — see the standing rule that jsdom does no layout. Each
 * rule below was a live defect found by probing the real browser; the point of the
 * test is that the next person cannot silently undo one.
 */

const CSS = readFileSync(resolve(__dirname, '../../../index.css'), 'utf-8')

const PRESETS = ['blue', 'purple', 'green', 'orange', 'red'] as const

/**
 * Every rule body whose selector matches exactly. A selector can legitimately appear
 * more than once — `:root` is opened by the mobile type-scale media query long before
 * the palette — so a first-match lookup reads the wrong block and reports a token as
 * missing when it is merely declared later.
 */
function blocks(selector: string): string[] {
    const found: string[] = []
    let from = 0
    for (;;) {
        const i = CSS.indexOf(selector + ' {', from)
        if (i === -1) break
        found.push(CSS.slice(i, CSS.indexOf('}', i)))
        from = i + 1
    }
    if (!found.length) throw new Error(`No rule found for selector: ${selector}`)
    return found
}

/** The value of `prop` from whichever matching rule declares it. */
function declared(selector: string, prop: string): string | null {
    for (const body of blocks(selector)) {
        const m = new RegExp(`${prop}:\\s*([^;]+);`).exec(body)
        if (m) return m[1].trim()
    }
    return null
}

describe('admin palette invariants', () => {
    describe('every preset owns its own foreground in every theme', () => {
        // The dark presets once set only --primary/-hover/-subtle, so each inherited
        // the LIGHT --admin-sidebar-active-text and painted e.g. #1d4ed8 on a
        // near-black active pill.
        it.each(PRESETS)('light "%s" sets both its active background and text', (preset) => {
            const sel = `[data-surface="admin"][data-preset="${preset}"]`
            expect(declared(sel, '--admin-sidebar-active')).toBeTruthy()
            expect(declared(sel, '--admin-sidebar-active-text')).toBeTruthy()
        })

        it.each(PRESETS)('dark "%s" sets both its active background and text', (preset) => {
            const sel = `[data-surface="admin"][data-theme="dark"][data-preset="${preset}"]`
            expect(declared(sel, '--admin-sidebar-active')).toBeTruthy()
            expect(declared(sel, '--admin-sidebar-active-text')).toBeTruthy()
        })
    })

    describe('neutral means hovering, accent means selected', () => {
        it('table row hover is a literal neutral, never derived from the accent', () => {
            for (const sel of [':root', '[data-surface="admin"][data-theme="dark"]']) {
                const hover = declared(sel, '--admin-table-row-hover')
                expect(hover).toBeTruthy()
                // Accent-tinted hover put the accent on every row the pointer crossed,
                // so an orange or red preset stopped reading as accented at all.
                expect(hover).not.toContain('--primary')
            }
        })

        it('table row selected IS derived from the accent', () => {
            expect(declared('[data-surface="admin"]', '--admin-table-row-selected'))
                .toContain('--primary-subtle')
        })
    })

    describe('accent-derived tokens resolve against the preset, not :root', () => {
        // A custom property holding var(--other) is substituted where it is DECLARED.
        // On :root these froze to :root's blue, so the green and red presets rendered
        // selected rows and focused inputs in blue while everything else was correct.
        it.each(['--admin-table-row-selected', '--admin-input-focus'])(
            '%s is declared on the element carrying data-preset',
            (token) => {
                expect(declared('[data-surface="admin"]', token)).toContain('--primary')
            },
        )
    })

    describe('an accent surface is never the same colour as a status surface', () => {
        // Every status colour that exists, not just red — a status badge added later
        // (e.g. purple, chosen to sit next to a same-named "purple" preset) is exactly
        // the shape of thing this collision already bit once for red.
        const STATUS_COLORS = ['red', 'green', 'yellow', 'purple', 'pink'] as const

        it.each(STATUS_COLORS)('no preset subtle collides with the %s status background in either theme', (statusColor) => {
            const statusLight = declared(':root', `--admin-status-${statusColor}-bg`)
            const statusDark = declared('[data-surface="admin"][data-theme="dark"]', `--admin-status-${statusColor}-bg`)

            for (const preset of PRESETS) {
                const light = declared(`[data-surface="admin"][data-preset="${preset}"]`, '--primary-subtle')
                const dark = declared(
                    `[data-surface="admin"][data-theme="dark"][data-preset="${preset}"]`, '--primary-subtle')
                // An error badge and a selected row sharing a colour makes one of them
                // unreadable as what it is; red-50 and the red preset collided exactly.
                expect(light).not.toBe(statusLight)
                expect(dark).not.toBe(statusDark)
            }
        })
    })

    describe('light mode keeps distinct surface levels', () => {
        it('page, chrome, panel, table header and hover are five different values', () => {
            const values = [
                declared(':root', '--admin-bg'),
                declared(':root', '--admin-sidebar-bg'),
                declared(':root', '--admin-panel'),
                declared(':root', '--admin-table-header-bg'),
                declared(':root', '--admin-table-row-hover'),
            ]
            expect(values.every(Boolean)).toBe(true)
            // Collapsing these is what made light mode read as "white or pale grey".
            expect(new Set(values).size).toBe(values.length)
        })
    })
})
