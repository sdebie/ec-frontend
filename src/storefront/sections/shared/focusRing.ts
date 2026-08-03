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

/**
 * Circular chip for a social icon link — used by the announcement bar and the
 * footer, which are the two surfaces that render `footer.socialLinks`.
 *
 * Ring and hover wash ride `currentColor`, so the chip inherits whatever colour
 * its surface sets (the bar's configured `textColor`, the footer's nav icon
 * token) instead of pinning a palette value. Consumers append their own focus
 * recipe and size — this carries no border-radius conflict because it sets the
 * radius itself and the focus recipes deliberately carry none.
 */
export const SOCIAL_CHIP_CLASS =
  'inline-flex items-center justify-center rounded-full border border-current/40 transition-colors hover:border-current/80 hover:bg-current/15'

/**
 * Hover treatment for the header's icon controls (cart, wishlist, account,
 * burger).
 *
 * The accent arrives as the FILL, not the text colour: the nav sits on
 * `--sf-nav-background` (#111 for this client) and painting `--sf-accent`
 * (#7a0019) as text on it lands around 1.5:1 — unreadable. As a fill with
 * `--sf-accent-text` on top it is ~12:1 and unmistakably the brand colour.
 *
 * The accent is LIGHTENED toward white rather than dimmed by opacity: on a near
 * black bar, lowering the accent's alpha only sinks it further into the
 * background. Mixing 80% accent with white lifts it to roughly rgb(149,51,71) —
 * visibly brighter than the raw accent, and white on it still measures ~7.4:1.
 */
export const NAV_ICON_HOVER =
  'text-(--sf-nav-icon-text) transition-colors hover:bg-[color-mix(in_srgb,var(--sf-accent)_80%,white)] hover:text-(--sf-accent-text)'
