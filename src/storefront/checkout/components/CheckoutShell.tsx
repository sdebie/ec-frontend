import type {ReactNode} from 'react'
import {Section, SectionHeading} from '@/storefront/sections/shared'

/**
 * The checkout page shell — the same frame the catalogue, wishlist and cart use:
 * `Section as="div" width="wide"` (StorefrontLayout owns the single <main>
 * landmark) with the shared heading and the `space-y-6` rhythm. Every checkout
 * state renders inside it, so the page never changes shape between states.
 */
export function CheckoutShell({title = 'Checkout', children}: { title?: string; children: ReactNode }) {
    return (
        <Section as="div" width="wide">
            <div className="space-y-6">
                <SectionHeading as="h1" title={title} className="mb-0"/>
                {children}
            </div>
        </Section>
    )
}
