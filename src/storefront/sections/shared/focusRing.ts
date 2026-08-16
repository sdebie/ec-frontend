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
 * Hover/pressed interaction classes for solid accent buttons.
 *
 * The two steps are derived from `--sf-accent` in `index.css`, which is also
 * what lets a client override either one by seeding it and what gives the
 * shared `Button` primitive's solid variant the same treatment through
 * `--c-accent-hover`. Both tokens are always defined, so they are read bare.
 *
 * Not `hover:opacity-90`, which fades the button toward whatever sits behind it
 * instead of shifting the accent itself.
 */
export const ACCENT_BUTTON_HOVER =
  'hover:bg-(--sf-accent-hover) active:bg-(--sf-accent-active)'

/**
 * Hover/pressed interaction classes for SECONDARY (outlined) buttons.
 *
 * A secondary stays subordinate to the primary in every state, so its hover is a
 * low-alpha wash toward the surface's own foreground — never a fill derived from
 * the accent. An accent-derived fill lands an outlined button LIGHTER than the
 * solid primary beside it, which inverts the hierarchy: the quieter control
 * becomes the loudest thing on the band the moment it is pointed at.
 *
 * `light` is for page surfaces, where the label and border are `--sf-accent`.
 * Both step to `--sf-accent-hover`, the same step the primary's fill takes, so
 * the two buttons darken together instead of moving in opposite directions.
 *
 * `dark` is for dark, photographic and accent-band surfaces, where the label is
 * `--sf-accent-text`. There a wash can only go toward the light foreground —
 * darkening would sink the control into its own background.
 */
export const SECONDARY_BUTTON_HOVER_LIGHT =
  'hover:border-(--sf-accent-hover) hover:text-(--sf-accent-hover) hover:bg-[color-mix(in_srgb,var(--sf-accent)_8%,transparent)]'

export const SECONDARY_BUTTON_HOVER_DARK =
  'hover:border-(--sf-accent-text)/70 hover:bg-(--sf-accent-text)/10'

/** Convenience object for template-string interpolation, as SF_FOCUS_RING. */
export const SECONDARY_BUTTON_HOVER = {
  light: SECONDARY_BUTTON_HOVER_LIGHT,
  dark: SECONDARY_BUTTON_HOVER_DARK,
} as const

/**
 * Hover for the solid button that sits ON an accent band, where the fill is
 * `--sf-accent-text` because an accent fill would vanish into the band.
 *
 * The fill steps toward the accent rather than toward black or white, because
 * `--sf-accent-text` may be either one: darkening does nothing to a black label
 * on a light accent, and lightening does nothing to a white one. Moving toward
 * its own accent always shifts it, and keeps the pair related instead of
 * introducing a third colour.
 *
 * The button's colours must be CLASSES, not an inline `style` — an inline style
 * outranks every hover rule, so the class applies and nothing paints.
 */
export const ON_ACCENT_BUTTON_HOVER =
  'hover:bg-[color-mix(in_srgb,var(--sf-accent-text)_90%,var(--sf-accent))]'

/**
 * Hover for text-accent links (text colour only, no background).
 *
 * Steps to `--sf-accent-hover`, the same token the primary's fill and the light
 * secondary's label take, so every accent-coloured thing on the page darkens by
 * one consistent step. A percentage mix cannot do that: it is multiplicative, so
 * the darker the client's accent the smaller the shift it produces.
 */
export const ACCENT_LINK_HOVER = 'hover:text-(--sf-accent-hover)'

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
 * The bar is dark chrome, so its controls light UP toward the nav's own
 * foreground instead of taking on the accent. `--sf-nav-icon-text-hover` is
 * seeded for exactly this and the search button already reads it, so the whole
 * header responds in one voice — and a client that brands a light nav gets a
 * wash that darkens, because the token moves with the surface.
 *
 * Keeping the wash neutral and low-alpha is what lets the accent count badge
 * stay legible on top of it. Brand presence in the header comes from that badge
 * and the accent focus ring; painting the control itself accent puts a solid
 * block of colour beside the accent-OUTLINED buttons on the page, which reads as
 * a different design language rather than the same one.
 */
export const NAV_ICON_HOVER =
  'text-(--sf-nav-icon-text) transition-colors hover:bg-(--sf-nav-icon-text-hover)/10 hover:text-(--sf-nav-icon-text-hover)'

/**
 * The header's icon control: a rounded square that washes toward the nav
 * foreground on hover and carries a faint ring of the same colour.
 *
 * `rounded-md` is the header's radius throughout — the search field and its
 * button, the account menu, the burger and the nav CTA all use it. A circle here
 * is the one shape that disagrees with its own bar.
 *
 * Shared because the cart, wishlist and account controls must be identical —
 * they sit side by side, and any divergence in padding or radius reads as a
 * misalignment. Every glyph in the set answers the same way, with colour and the
 * wash behind it; none of them fills or changes shape.
 *
 * The ring is a quarter-alpha rather than solid: at full strength it competes
 * with the wash instead of containing it, and the control stops reading as one
 * shape.
 *
 * `p-2.5` rather than `p-2` keeps the hover wash a comfortable square around a
 * 20px glyph instead of hugging it. The border is always present but
 * transparent, so nothing shifts on hover.
 */
export const NAV_ICON_PILL =
  `relative flex items-center justify-center rounded-md border border-transparent p-2.5 ${NAV_ICON_HOVER} hover:border-(--sf-nav-icon-text-hover)/25`

/**
 * The count badge that rides in a NAV_ICON_PILL's top-right corner.
 *
 * It holds its accent identity through hover. The pill's wash is neutral and
 * low-alpha, so the badge stays legible without swapping colours — and a count
 * is information, not an affordance, so it should not appear to respond to the
 * pointer while the control around it does.
 */
export const NAV_ICON_BADGE =
  'absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--sf-accent) px-1 text-[10px] font-medium text-(--sf-accent-text)'
