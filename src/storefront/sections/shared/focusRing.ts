/**
 * Shared storefront focus-visible ring recipe.
 *
 * Two variants:
 * - `page`: ring offset uses `--sf-background` (page surface)
 * - `nav`: ring offset uses `--sf-nav-background` (dark nav surface)
 *
 * Applied via `cn(SF_FOCUS_RING.page, ...)` or `cn(SF_FOCUS_RING.nav, ...)`.
 * Matches the AccreditorsSection precedent (outline-none + focus-visible:ring-2).
 */

/** Focus ring on page-surface elements (light background offset). */
export const SF_FOCUS_RING_PAGE =
  'outline-none focus-visible:ring-2 focus-visible:ring-(--sf-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--sf-background)'

/** Focus ring on nav-surface elements (dark background offset). */
export const SF_FOCUS_RING_NAV =
  'outline-none focus-visible:ring-2 focus-visible:ring-(--sf-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--sf-nav-background)'

/** Convenience object for template-string interpolation (e.g. `${SF_FOCUS_RING.nav}`). */
export const SF_FOCUS_RING = {
  page: SF_FOCUS_RING_PAGE,
  nav: SF_FOCUS_RING_NAV,
} as const

/**
 * Hover/active interaction classes for solid accent buttons.
 *
 * Replaces the old `hover:opacity-90` pattern with deterministic color-mix
 * tints that darken the accent at fixed ratios — consistent with the existing
 * accent-derivation family (`color-mix(in srgb, var(--sf-accent) N%, black)`).
 */
export const ACCENT_BUTTON_HOVER =
  'hover:bg-[color-mix(in_srgb,var(--sf-accent)_88%,black)] active:bg-[color-mix(in_srgb,var(--sf-accent)_78%,black)]'

/**
 * Hover class for text-accent links (text colour only, no background).
 * Uses a slightly tinted accent for the hover state.
 */
export const ACCENT_LINK_HOVER =
  'hover:text-[color-mix(in_srgb,var(--sf-accent)_80%,black)]'
