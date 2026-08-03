import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Grep gate: no storefront section passes arrowPlacement as a string literal
 * in JSX props. Every carousel treatment must come from the resolved
 * carouselControls display hint (a variable), never a hardcoded string.
 *
 * Allowed:   arrowPlacement={resolvedHint}   { arrowPlacement: hint }
 * Forbidden: arrowPlacement="overlay"        { arrowPlacement: 'overlay' }
 *
 * BOTH forms are checked. An earlier revision excluded the object-spread form
 * on the grounds that it is "computed from the hint variable" — that was false
 * for `{ arrowPlacement: 'overlay' as const }`, a hardcoded literal that the
 * gate was consequently written around. A treatment must come from the resolved
 * hint whichever syntax carries it, so the gate now covers both.
 */
describe('Carousel hint grep gate (design C14)', () => {
    /**
     * Recursively collects all .tsx files under the sections directory,
     * excluding __tests__/ and shared/ primitives (Carousel.tsx itself).
     */
    function collectSectionFiles(dir: string, files: string[] = []): string[] {
        const entries = readdirSync(dir)
        for (const entry of entries) {
            const fullPath = join(dir, entry)
            const stat = statSync(fullPath)
            if (stat.isDirectory()) {
                if (entry === '__tests__' || entry === 'shared' || entry === 'node_modules') continue
                collectSectionFiles(fullPath, files)
            } else if (entry.endsWith('.tsx') && !entry.includes('.test.')) {
                files.push(fullPath)
            }
        }
        return files
    }

    it('no section file passes arrowPlacement as a string literal', () => {
        const sectionsDir = join(__dirname, '..', '..')
        const files = collectSectionFiles(sectionsDir)

        // Matches BOTH carriers of a hardcoded treatment:
        //   JSX attribute   → arrowPlacement="overlay" / arrowPlacement='gutter'
        //   object property → { arrowPlacement: 'overlay' as const }
        const forbidden = /arrowPlacement\s*[=:]\s*["']/

        const violations: string[] = []

        for (const file of files) {
            const content = readFileSync(file, 'utf-8')
            const lines = content.split('\n')
            for (let i = 0; i < lines.length; i++) {
                if (forbidden.test(lines[i])) {
                    const relativePath = file.replace(sectionsDir, 'src/storefront/sections')
                    violations.push(`${relativePath}:${i + 1} → ${lines[i].trim()}`)
                }
            }
        }

        expect(
            violations,
            'Sections must pass arrowPlacement via a variable (the resolved hint), ' +
            'not a hardcoded string literal. Violations:\n' + violations.join('\n'),
        ).toEqual([])
    })
})
