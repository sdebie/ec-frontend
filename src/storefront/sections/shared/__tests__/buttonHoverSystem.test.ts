import {describe, expect, it} from 'vitest'
import {readFileSync, readdirSync, statSync} from 'fs'
import {join} from 'path'
import {
    ACCENT_BUTTON_HOVER,
    ACCENT_LINK_HOVER,
    NAV_ICON_BADGE,
    NAV_ICON_HOVER,
    NAV_ICON_PILL,
    SECONDARY_BUTTON_HOVER,
    SECONDARY_BUTTON_HOVER_DARK,
    SECONDARY_BUTTON_HOVER_LIGHT,
    SF_FOCUS_RING_PAGE,
    SF_FOCUS_RING_NAV,
} from '../focusRing'
import {DEFINED_SF_TOKENS} from '@/shared/config/themeTokens'

describe('Button hover/pressed system (design C3)', () => {
    describe('focus ring constants', () => {
        it('SF_FOCUS_RING_PAGE contains the correct focus-visible recipe with page offset', () => {
            expect(SF_FOCUS_RING_PAGE).toContain('outline-none')
            expect(SF_FOCUS_RING_PAGE).toContain('focus-visible:ring-2')
            expect(SF_FOCUS_RING_PAGE).toContain('focus-visible:ring-(--sf-ring)')
            expect(SF_FOCUS_RING_PAGE).toContain('focus-visible:ring-offset-2')
            expect(SF_FOCUS_RING_PAGE).toContain('focus-visible:ring-offset-(--sf-background)')
        })

        it('SF_FOCUS_RING_NAV contains the correct focus-visible recipe with nav offset', () => {
            expect(SF_FOCUS_RING_NAV).toContain('outline-none')
            expect(SF_FOCUS_RING_NAV).toContain('focus-visible:ring-2')
            expect(SF_FOCUS_RING_NAV).toContain('focus-visible:ring-(--sf-ring)')
            expect(SF_FOCUS_RING_NAV).toContain('focus-visible:ring-offset-2')
            expect(SF_FOCUS_RING_NAV).toContain('focus-visible:ring-offset-(--sf-nav-background)')
        })
    })

    describe('accent button hover constants', () => {
        it('ACCENT_BUTTON_HOVER drives hover and pressed off the derived accent tokens', () => {
            expect(ACCENT_BUTTON_HOVER).toContain('hover:bg-(--sf-accent-hover)')
            expect(ACCENT_BUTTON_HOVER).toContain('active:bg-(--sf-accent-active)')
        })

        it('reads both tokens bare, so the theme-token guard must define them', () => {
            // A bare read of an undefined token is dropped by the browser and the
            // button silently never changes colour. Membership here is what makes
            // themeTokens.test.ts fail the build if the derivation is removed.
            for (const token of ['--sf-accent-hover', '--sf-accent-active']) {
                expect(ACCENT_BUTTON_HOVER).toContain(`(${token})`)
                expect(DEFINED_SF_TOKENS.has(token)).toBe(true)
            }
        })

        it('ACCENT_LINK_HOVER contains color-mix text hover state', () => {
            expect(ACCENT_LINK_HOVER).toContain('hover:text-[color-mix(in_srgb,var(--sf-accent)')
            expect(ACCENT_LINK_HOVER).toMatch(/black\)]/g)
        })
    })

    describe('secondary button hover constants', () => {
        it('light variant steps border and label to the same token the primary fill uses', () => {
            // Both controls darken by one step, so a primary and a secondary side
            // by side move together rather than in opposite directions.
            expect(SECONDARY_BUTTON_HOVER_LIGHT).toContain('hover:border-(--sf-accent-hover)')
            expect(SECONDARY_BUTTON_HOVER_LIGHT).toContain('hover:text-(--sf-accent-hover)')
            expect(ACCENT_BUTTON_HOVER).toContain('hover:bg-(--sf-accent-hover)')
        })

        it('dark variant washes toward the surface foreground, not the accent', () => {
            expect(SECONDARY_BUTTON_HOVER_DARK).toContain('hover:bg-(--sf-accent-text)/10')
            expect(SECONDARY_BUTTON_HOVER_DARK).not.toContain('--sf-accent)')
        })

        it('neither variant fills with an opaque accent-derived colour', () => {
            // An opaque accent tint lands an outlined button LIGHTER than the solid
            // primary beside it, inverting the hierarchy. The light variant's fill
            // must stay a low-alpha tint; the dark variant carries no accent fill.
            for (const recipe of [SECONDARY_BUTTON_HOVER_LIGHT, SECONDARY_BUTTON_HOVER_DARK]) {
                expect(recipe).not.toContain(',white)]')
                expect(recipe).not.toContain('hover:bg-(--sf-accent)')
            }
            expect(SECONDARY_BUTTON_HOVER_LIGHT).toContain('_8%,transparent)]')
        })

        it('exposes the variants as an object, as SF_FOCUS_RING does', () => {
            expect(SECONDARY_BUTTON_HOVER.light).toBe(SECONDARY_BUTTON_HOVER_LIGHT)
            expect(SECONDARY_BUTTON_HOVER.dark).toBe(SECONDARY_BUTTON_HOVER_DARK)
        })
    })

    describe('header icon controls', () => {
        it('lights up toward the seeded nav foreground, not the accent', () => {
            // --sf-nav-icon-text-hover is seeded for this and SearchBar already
            // reads it, so the whole header responds in one voice. It also tracks
            // the surface: a client branding a light nav gets a wash that darkens.
            expect(NAV_ICON_HOVER).toContain('hover:bg-(--sf-nav-icon-text-hover)/10')
            expect(NAV_ICON_HOVER).toContain('hover:text-(--sf-nav-icon-text-hover)')
            expect(NAV_ICON_HOVER).not.toContain('--sf-accent')
        })

        it('rings the pill in the same colour it washes with', () => {
            expect(NAV_ICON_PILL).toContain('hover:border-(--sf-nav-icon-text-hover)/25')
            expect(NAV_ICON_PILL).not.toContain('hover:border-(--sf-accent)')
        })

        it('badge keeps its accent identity through hover', () => {
            // A count is information, not an affordance. The neutral wash keeps it
            // legible, so it has no reason to swap colours under the pointer.
            expect(NAV_ICON_BADGE).toContain('bg-(--sf-accent)')
            expect(NAV_ICON_BADGE).toContain('text-(--sf-accent-text)')
            expect(NAV_ICON_BADGE).not.toContain('group-hover:')
        })

        it('pill still provides the group WishlistIcon fills its heart from', () => {
            expect(NAV_ICON_PILL).toContain('group ')
        })
    })

    describe('grep gate: no hover:opacity-90 in storefront components', () => {
        /**
         * Recursively collects all .tsx and .ts files under a directory,
         * excluding test files and node_modules.
         */
        function collectFiles(dir: string, files: string[] = []): string[] {
            const entries = readdirSync(dir)
            for (const entry of entries) {
                const fullPath = join(dir, entry)
                const stat = statSync(fullPath)
                if (stat.isDirectory()) {
                    if (entry === 'node_modules' || entry === '__tests__') continue
                    collectFiles(fullPath, files)
                } else if (/\.(tsx?|ts)$/.test(entry) && !entry.includes('.test.')) {
                    files.push(fullPath)
                }
            }
            return files
        }

        it('no storefront component file contains hover:opacity-90 (except the JSDoc comment in focusRing.ts)', () => {
            const storefrontDir = join(__dirname, '..', '..', '..')
            const files = collectFiles(storefrontDir)
            const violations: string[] = []

            for (const file of files) {
                // Skip the focusRing utility: its JSDoc names the banned class
                if (file.endsWith('focusRing.ts')) continue

                const content = readFileSync(file, 'utf-8')
                if (content.includes('hover:opacity-90')) {
                    violations.push(file.replace(storefrontDir, 'src/storefront'))
                }
            }

            expect(violations).toEqual([])
        })

        it('no storefront file lightens the accent toward white', () => {
            // A lightened accent is a desaturated tint, not the brand colour, and
            // on a control it outranks the solid primary beside it. Anything on a
            // dark surface washes toward that surface's own foreground instead:
            // SECONDARY_BUTTON_HOVER_DARK for buttons, NAV_ICON_HOVER for the
            // header controls. No file needs the recipe, so there is no exemption.
            const storefrontDir = join(__dirname, '..', '..', '..')
            const violations = collectFiles(storefrontDir)
                .filter((file) => readFileSync(file, 'utf-8').includes('var(--sf-accent)_80%,white'))
                .map((file) => file.replace(storefrontDir, 'src/storefront'))

            expect(violations).toEqual([])
        })
    })
})
