import { describe, expect, it } from 'vitest'

/**
 * Law-2 guard for the ADMIN surface.
 *
 * The admin portal themes exclusively through `--c-*` tokens (plus the
 * `primary`/`primary-subtle` theme utilities), so a literal Tailwind palette
 * class (`text-red-500`, `bg-green-100`, …) does not recolour with the admin
 * presets or dark mode — it silently pins one preset's look.
 *
 * The `themeTokens` guard covers `--sf-*` reads only; two consecutive reviews
 * missed admin violations because every grep was scoped to the storefront.
 * This test closes that gap for `src/admin` and `src/shared/ui` (which renders
 * on the admin surface).
 *
 * The storefront is deliberately out of scope: it has documented palette
 * exceptions (pre-theme pages, overlays) and its own token guard.
 */
const sources = import.meta.glob('/src/{admin,shared/ui}/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * A named Tailwind palette colour with a numeric shade, in any utility and
 * under any variant prefix (`hover:`, `focus:`, `md:`…). Arbitrary values
 * (`bg-[#00000080]`) are not matched — overlays legitimately use those.
 *
 * Comments are not stripped: quote a palette class in prose ("the red-500
 * asterisk"), never verbatim, or the guard flags it. Over-strictness is the
 * safe direction — see themeTokens.test.ts for the rationale.
 */
const PALETTE_CLASS =
  /(?:^|[\s"'`{:])(?:[a-z-]+:)*(?:bg|text|border|ring|fill|stroke|divide|outline|decoration|shadow|accent|caret)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}(?![\w-])/g

/** Test files may name palette classes when asserting on them. */
const EXCLUDED_SEGMENTS = ['/__tests__/', '.test.', '.spec.']

describe('admin palette classes', () => {
  it('scans a non-trivial number of source files', () => {
    // Guards the guard: a glob that silently matched nothing would make the
    // assertion below vacuous.
    expect(Object.keys(sources).length).toBeGreaterThan(100)
  })

  it('admin and shared UI sources carry NO hardcoded Tailwind palette classes', () => {
    const violations: string[] = []

    for (const [file, text] of Object.entries(sources)) {
      if (EXCLUDED_SEGMENTS.some((segment) => file.includes(segment))) continue

      PALETTE_CLASS.lastIndex = 0
      for (const match of text.matchAll(PALETTE_CLASS)) {
        violations.push(`${file}: ${match[0].trim()}`)
      }
    }

    expect(violations, [
      'Hardcoded palette classes on the admin surface — use the token layer instead:',
      '  errors → text-(--c-error) · destructive hover → text-(--c-danger)',
      '  status badges → bg-(--c-status-*-bg) text-(--c-status-*-text)',
      '  muted text → text-(--c-text-muted) · active pills → bg-primary-subtle text-primary',
      ...violations,
    ].join('\n')).toEqual([])
  })
})
