import {describe, expect, it} from 'vitest'
import {readFileSync, readdirSync, statSync} from 'fs'
import {join} from 'path'
import {
    ACCENT_BUTTON_HOVER,
    ACCENT_LINK_HOVER,
    SF_FOCUS_RING_PAGE,
    SF_FOCUS_RING_NAV,
} from '../focusRing'

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
        it('ACCENT_BUTTON_HOVER contains color-mix hover and active states', () => {
            expect(ACCENT_BUTTON_HOVER).toContain('hover:bg-[color-mix(in_srgb,var(--sf-accent)')
            expect(ACCENT_BUTTON_HOVER).toContain('active:bg-[color-mix(in_srgb,var(--sf-accent)')
            // Must include black as the darkening anchor
            expect(ACCENT_BUTTON_HOVER).toMatch(/black\)]/g)
        })

        it('ACCENT_LINK_HOVER contains color-mix text hover state', () => {
            expect(ACCENT_LINK_HOVER).toContain('hover:text-[color-mix(in_srgb,var(--sf-accent)')
            expect(ACCENT_LINK_HOVER).toMatch(/black\)]/g)
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
    })
})
