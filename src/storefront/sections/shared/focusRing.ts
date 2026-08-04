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
 * Deterministic color-mix tints that darken the accent at fixed ratios, in the
 * same accent-derivation family used elsewhere. Not `hover:opacity-90`, which
 * fades the button toward whatever sits behind it instead of darkening it.
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

/**
 * The header's icon control: a circular pill that fills with the lightened
 * accent on hover and carries a raw-accent ring around it.
 *
 * Shared because the cart, wishlist and account controls must be identical —
 * they sit side by side, and any divergence in padding or radius reads as a
 * misalignment. `group` is part of the contract: the badge and any icon fill
 * below key off it.
 *
 * `p-2.5` rather than `p-2`: a count badge overhangs the top-right corner, and
 * the extra padding is what lets the ring enclose the badge instead of slicing
 * through it. The border is always present but transparent, so nothing shifts
 * on hover.
 */
export const NAV_ICON_PILL =
  `group relative flex items-center justify-center rounded-full border border-transparent p-2.5 ${NAV_ICON_HOVER} hover:border-(--sf-accent)`

/**
 * The count badge that rides in a NAV_ICON_PILL's top-right corner.
 *
 * It INVERTS on hover: an accent badge on the pill's lightened-accent fill
 * measures ~1.5:1 and would all but vanish, so the two colours swap. Requires
 * `group` on the pill — NAV_ICON_PILL provides it.
 */
export const NAV_ICON_BADGE =
  'absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--sf-accent) px-1 text-[10px] font-medium text-(--sf-accent-text) transition-colors group-hover:bg-(--sf-accent-text) group-hover:text-(--sf-accent)'
