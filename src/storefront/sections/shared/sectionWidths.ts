/**
 * Container widths for the shared `Section` frame.
 *
 * `default` widened max-w-5xl → max-w-6xl (owner directive 2026-08-03): at
 * 1280px the old 1024px column left 128px of dead gutter each side, and every
 * transactional page already runs `wide`, so the section-composed pages were
 * the narrowest thing on the site rather than the norm. max-w-6xl (1152px)
 * puts a section's left edge at x=64 on a 1280px viewport.
 *
 * Lives in its own module rather than beside the component so a band that
 * paints its own background — CategoryShowcaseSection needs a client gradient,
 * so it cannot use `Section` — can line up with the frame by reading the same
 * value instead of copying the literal. That copy is exactly what let the
 * showcase drift 112px out of alignment with the rest of the home page.
 */
export type SectionWidth = 'narrow' | 'default' | 'wide'

export const SECTION_WIDTH_CLASS: Record<SectionWidth, string> = {
    narrow: 'max-w-2xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
}
