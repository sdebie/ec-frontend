import {cn} from '@/shared/utils/cn'

/**
 * The full-width rule that separates a page's heading block from its body.
 *
 * Part of the standard page-title composition — `SectionHeading as="h1"` (which
 * carries the short accent rule), then this divider, then the page content. It
 * is themed, not client-specific: the line is `--sf-border`, so each client's
 * seeded palette draws its own.
 *
 * Extracted from `ProductDetailPage`, which held the only copy while
 * `/products` got the same rhythm from its toolbar's bottom border. The
 * Wholesale Application and Request a Quote pages had neither, which is what
 * made them look unfinished beside every other page.
 *
 * `className` is for spacing only (the enclosing page owns its rhythm).
 */
export function PageDivider({className}: { className?: string }) {
    return <div aria-hidden="true" className={cn('mb-3 border-t border-(--sf-border)', className)}/>
}
