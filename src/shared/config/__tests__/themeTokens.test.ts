import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

import { DEFINED_SF_TOKENS, DERIVED_TOKENS } from '../themeTokens'

/**
 * Theme-token contract guard.
 *
 * Fails the build when a source file reads an `--sf-*` custom property that no
 * seed and no stylesheet defines, unless the read supplies a fallback.
 *
 * Catches what neither the type system, the linter, the build nor jsdom can: an
 * undefined custom property is an invalid declaration, the browser drops it, and
 * the element silently keeps its previous paint.
 *
 * Asserting the CLASS is present does not catch this — jsdom has no CSS engine,
 * so such a test passes either way. Checking token names against the vocabulary
 * is static, which is why it works.
 */

/**
 * Vite raw-imports every TS/TSX source file's text.
 *
 * Stylesheets are deliberately NOT globbed here — under Vitest, `?raw` hands
 * back an EMPTY STRING for `.css`, so including them yields entries that match
 * nothing and report nothing while looking scanned. They are read from disk
 * instead, below.
 */
const sources = import.meta.glob('/src/**/*.{ts,tsx}', {
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
 * (`--sf-surface-dark`, `--sf-accent-subtle`) or a value that is undefined
 * until measured (`--sf-chrome-h`).
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

/** This file sits at `src/shared/config/__tests__`, so `src/` is three up. */
const SRC_ROOT = join(__dirname, '..', '..', '..')

/** Every stylesheet under `src/`, by absolute path, for the fs-based reads. */
function collectStylesheets(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry !== 'node_modules') collectStylesheets(full, found)
    } else if (entry.endsWith('.css')) {
      found.push(full)
    }
  }
  return found
}

const STYLESHEETS = collectStylesheets(SRC_ROOT)

/**
 * Stylesheet text, keyed like the glob (`/src/...`) so one scan covers both
 * kinds of file and a failure report reads the same either way.
 *
 * Stylesheets matter here more than their file count suggests: `tokens.css` is
 * where the whole `--c-*` layer derives from `--sf-*` (`--c-accent:
 * var(--sf-accent)`), so a token retired from the seed goes on resolving in the
 * type system and dies only in the browser — the exact failure this guard exists
 * to catch.
 */
const stylesheetSources: Record<string, string> = Object.fromEntries(
  STYLESHEETS.map((file) => [`/src${file.slice(SRC_ROOT.length)}`, readFileSync(file, 'utf-8')])
)

interface Usage {
  token: string
  file: string
}

function collectUsages(): Usage[] {
  const usages: Usage[] = []

  for (const [file, text] of Object.entries({ ...sources, ...stylesheetSources })) {
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

  it('scans every stylesheet, and reads real text from each', () => {
    // Guards the guard, and it takes BOTH halves: a stylesheet count alone is
    // not enough, because a glob that matches a file but hands back an empty
    // string would pass that check while scanning nothing at all — this also
    // asserts real content length for each file.
    expect(Object.keys(stylesheetSources).length).toBeGreaterThan(0)

    for (const [file, text] of Object.entries(stylesheetSources)) {
      expect(text.length, `${file} was read as empty`).toBeGreaterThan(0)
    }
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

  it.each(DERIVED_TOKENS)('%s is actually declared by a stylesheet', (token) => {
    // Membership in the vocabulary above is a NAME check — it would keep passing
    // if the derivation were deleted, leaving every bare read dropped by the
    // browser and the interaction silently dead. Derived tokens are the only ones
    // this repo declares itself, so they are the only ones it can prove.
    const declaration = new RegExp(`^\\s*${token}\\s*:`, 'm')
    const declaredIn = Object.keys(stylesheetSources).filter((file) =>
      declaration.test(stylesheetSources[file])
    )

    expect(
      declaredIn.length > 0,
      `${token} is in DEFINED_SF_TOKENS but no stylesheet declares it. ` +
        'Components read it bare, so the declaration would be dropped and the ' +
        'element would never change. Restore the derivation in index.css, or ' +
        'remove the token from DERIVED_TOKENS and give every read a fallback.'
    ).toBe(true)
  })
})
