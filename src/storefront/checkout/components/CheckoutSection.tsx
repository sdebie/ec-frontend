import type {ReactNode} from 'react'

interface CheckoutSectionProps {
    /** Used for the heading id the section is labelled by — keep it stable. */
    id: string
    title: string
    children: ReactNode
}

/**
 * A step of the checkout form, in the same panel the order summary uses, so the
 * form reads as a set of cards rather than text on the page background.
 *
 * The three sections each hand-rolled this `<section aria-labelledby>` + `<h2>`
 * pairing; it lives here once so a heading can never drift out of step with the
 * label that points at it.
 */
export function CheckoutSection({id, title, children}: CheckoutSectionProps) {
    return (
        <section
            aria-labelledby={`${id}-heading`}
            className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-5 lg:p-6"
        >
            <h2 id={`${id}-heading`} className="text-lg font-semibold text-(--sf-text)">
                {title}
            </h2>
            {/* One place owns the gap under the heading, so the sections cannot
                drift apart the way three hand-rolled `mb-4`s did. */}
            <div className="mt-4">
                {children}
            </div>
        </section>
    )
}
