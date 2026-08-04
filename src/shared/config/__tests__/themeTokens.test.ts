import { describe, expect, it } from 'vitest'

import { DEFINED_SF_TOKENS } from '../themeTokens'

/**
 * Theme-token contract guard.
 *
 * Fails the build when a source file reads an `--sf-*` custom property that no
 * seed and no stylesheet defines, unless the read supplies a fallback.
 *
 * This catches what neither the type system, the linter, the build nor jsdom
 * can: an undefined custom property produces an invalid declaration, the browser
 * drops it, and the element silently keeps its previous paint. The incident this
 * guards against is `hover:text-(--sf-text-hover)` in FilterGroup — a token in no
 * seed and no stylesheet, live long enough to be found only by hovering the real
 * element in a browser and reading back an unchanged colour.
 *
 * A test that asserts the CLASS is present cannot catch this; jsdom has no CSS
 * engine, so it would have passed throughout. Checking the token names against
 * the vocabulary is a static check, which is exactly why it works here.
 */

// Vite raw-imports every source file's text; no fs / glob dependency needed.
const sources = import.meta.glob('/src/**/*.{ts,tsx,css}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/**
 * Reads that have NO fallback and therefore must resolve:
 *  - Tailwind v4 paren shorthand — `text-(--sf-text)`, `bg-(--sf-panel)`. This
 *    form cannot express a fallback at all.
 *  - A bare `var(--sf-x)` with no comma before the closing paren.
 *
 * `var(--sf-x, <fallback>)` is deliberately not matched: it degrades to the
 * fallback, which is the sanctioned way to read an optional client extension
 * (`--sf-surface-dark`, `--sf-accent-hover`, `--sf-accent-subtle`) or a value
 * that is undefined until measured (`--sf-chrome-h`).
 *
 * Comments are NOT stripped before scanning, so a comment that quotes the paren
 * shorthand verbatim is flagged like a live read. That is deliberate: a
 * comment-stripping regex that over-matched would make the whole guard vacuous
 * without saying so, and over-strictness is the safe direction here. Name a
 * retired token in prose ("the sf-text-hover token") rather than as a class.
 */
const TAILWIND_SHORTHAND = /-\((--sf-[a-z0-9-]+)\)/g
const BARE_VAR = /var\(\s*(--sf-[a-z0-9-]+)\s*\)/g

/** The vocabulary module and this test both name tokens outside a real read. */
const EXCLUDED = ['/src/shared/config/themeTokens.ts', '/src/shared/config/__tests__/themeTokens.test.ts']

interface Usage {
  token: string
  file: string
}

function collectUsages(): Usage[] {
  const usages: Usage[] = []

  for (const [file, text] of Object.entries(sources)) {
    if (EXCLUDED.includes(file)) continue

    for (const pattern of [TAILWIND_SHORTHAND, BARE_VAR]) {
      // Fresh lastIndex per file — these are module-level /g regexes.
      pattern.lastIndex = 0
      for (const match of text.matchAll(pattern)) {
        usages.push({ token: match[1], file })
      }
    }
  }

  return usages
}

describe('storefront theme tokens', () => {
  it('scans a non-trivial number of source files', () => {
    // Guards the guard: a glob that silently matched nothing would make every
    // assertion below vacuous.
    expect(Object.keys(sources).length).toBeGreaterThan(100)
  })

  it('never reads an --sf-* token that no seed or stylesheet defines', () => {
    const undefinedUsages = collectUsages().filter((usage) => !DEFINED_SF_TOKENS.has(usage.token))

    // Grouped by token so the failure names the fix, not just the symptom.
    const byToken = new Map<string, Set<string>>()
    for (const { token, file } of undefinedUsages) {
      byToken.set(token, (byToken.get(token) ?? new Set()).add(file))
    }

    const report = [...byToken.entries()]
      .map(([token, files]) => `  ${token}\n${[...files].map((f) => `    ${f}`).join('\n')}`)
      .join('\n')

    expect(
      byToken.size === 0,
      `Undefined --sf-* token(s) read without a fallback:\n${report}\n\n` +
        'An undefined custom property is dropped by the browser, so the rule has ' +
        'no visible effect and nothing else in the toolchain will tell you. Either ' +
        'use a token from the seeded vocabulary (see themeTokens.ts), give the read ' +
        'a fallback — var(--sf-x, <value>) — or add the key to the DEFAULT seed ' +
        '(ec-infra .../db/seed/default/R__001_platform_defaults.sql) and to ' +
        'SEEDED_THEME_TOKENS.'
    ).toBe(true)
  })

})
