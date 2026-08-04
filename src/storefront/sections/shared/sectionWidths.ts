/**
 * Container widths for the shared `Section` frame.
 *
 * One page width site-wide: every page takes `default`, so all content starts
 * on the same left edge.
 *
 * `wide` (1280px) exceeds the frame's padded content box at a 1280px viewport
 * and collapses to the bare gutter, starting content further left than
 * `default`. Measure before using it.
 *
 * Separate module so a band that paints its own background, and so cannot use
 * `Section`, can align by reading this instead of copying the literal.
 */
export type SectionWidth = 'narrow' | 'default' | 'wide'

export const SECTION_WIDTH_CLASS: Record<SectionWidth, string> = {
    narrow: 'max-w-2xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
}
