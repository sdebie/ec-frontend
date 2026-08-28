/**
 * The storefront theme-token vocabulary — the `--sf-*` custom properties a
 * component may rely on without supplying a fallback.
 *
 * This is a committed snapshot, the same device as
 * `src/shared/api/graphql/schema.graphql`: the authoritative definition lives in
 * another module (`ec-infra`'s default seed) which this repo cannot read at test
 * time, so the contract is mirrored here and guarded by a test. When the default
 * seed's `storefront.theme` gains or loses a key, update this list.
 *
 * Why a guard is needed at all: an undefined custom property fails SILENTLY.
 * `hover:text-(--sf-text-hover)` compiles to a real CSS rule whose value is
 * invalid, so the declaration is dropped and the element simply never changes
 * colour. Nothing in the type system, the linter, the build or jsdom can see it
 * — jsdom has no CSS engine at all, so a unit test asserting the class is
 * present passes while the paint never happens. This exact failure mode has
 * already shipped, in FilterGroup and the wishlist heart's `fill-current` —
 * both caught only by inspecting the live element in a browser, never by a
 * test.
 */

/**
 * Written onto `<html>` by StorefrontConfigProvider from the seeded
 * `storefront.theme` JSON, as `--sf-<kebab-case(key)>`.
 *
 * Source of truth: `ec-infra/src/main/resources/db/seed/default/
 * R__001_platform_defaults.sql`. The DEFAULT seed is deliberately the reference,
 * not UVH's: schema + defaults alone must boot the app as a generic store, so a
 * component may only depend on tokens every client is guaranteed to have. A
 * client seeding extra keys is free to do so, but nothing in `src/` may require
 * them.
 *
 * Note what is NOT here: there is no "sf-text-hover", "sf-primary",
 * "sf-surface" or "sf-text-muted" (it is `--sf-muted-text`) — each is a
 * plausible-looking guess, not a real token.
 *
 * The list mirrors the seed, not current usage — `--sf-radius` is seeded and
 * referenced nowhere in `src/`, which is a capability going unused, not a defect.
 */
export const SEEDED_THEME_TOKENS = [
  '--sf-background',
  '--sf-panel',
  '--sf-text',
  '--sf-muted-text',
  '--sf-accent',
  '--sf-accent-text',
  '--sf-border',
  '--sf-nav-background',
  '--sf-nav-text',
  '--sf-nav-text-hover',
  '--sf-nav-border',
  '--sf-nav-icon-text',
  '--sf-nav-icon-text-hover',
  '--sf-surface-muted',
  '--sf-ring',
  '--sf-radius',
  '--sf-shadow-sm',
  '--sf-shadow-lg',
] as const

/**
 * Storefront status colours, declared as stylesheet defaults in `index.css`
 * rather than seeded. A client that seeds them wins (an inline style on `<html>`
 * beats a stylesheet rule); a client that seeds nothing still renders.
 */
export const STATUS_TOKENS = [
  '--sf-error',
  '--sf-error-surface',
  '--sf-error-border',
  '--sf-success',
] as const

/**
 * Storefront accent interaction states, derived from `--sf-accent` in
 * `index.css` rather than seeded, so every client has a hover and pressed step
 * without configuring one.
 *
 * Same defaults contract as the status tokens: a client that seeds
 * `accentHover`/`accentActive` wins, because an inline style on `<html>` beats
 * a stylesheet rule.
 */
export const DERIVED_TOKENS = [
  '--sf-accent-hover',
  '--sf-accent-active',
] as const

/**
 * Everything a component may reference bare.
 *
 * `--sf-chrome-h` is deliberately absent. It is published at runtime by
 * `useChromeHeight` but is undefined until the first measurement, so it must
 * always be read as `var(--sf-chrome-h, 0px)` — and leaving it out of this set
 * is what keeps that requirement enforced rather than merely documented.
 *
 * Tokens genuinely outside the vocabulary (`--sf-surface-dark`,
 * `--sf-accent-subtle`) are equally absent by design: they are optional client
 * extensions and every read of them already supplies a fallback, which the
 * guard accepts.
 */
export const DEFINED_SF_TOKENS: ReadonlySet<string> = new Set<string>([
  ...SEEDED_THEME_TOKENS,
  ...STATUS_TOKENS,
  ...DERIVED_TOKENS,
])
