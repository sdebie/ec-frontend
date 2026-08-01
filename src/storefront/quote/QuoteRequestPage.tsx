import {useState} from 'react'
import {useQuoteStore} from './quoteStore'
import {QuoteList} from './components/QuoteList'
import {QuoteDetailsForm} from './components/QuoteDetailsForm'
import {QuoteProductSearch} from './components/QuoteProductSearch'

/**
 * QuoteRequestPage — public page shell for the quote request funnel.
 *
 * Two areas:
 * 1. "Products to quote" — shows the quote list (or empty state) + inline product search
 * 2. "Your details" — contact/details form
 *
 * After successful submission, shows a confirmation state.
 */
export function QuoteRequestPage() {
    const items = useQuoteStore((s) => s.items)
    const [submitted, setSubmitted] = useState(false)

    const isEmpty = items.length === 0

    if (submitted) {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-(--sf-accent)/10 p-3">
                        <svg
                            className="h-8 w-8 text-(--sf-accent)"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                            />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-(--sf-text)">
                        Quote request submitted
                    </h2>
                    <p className="mt-2 max-w-sm text-sm text-(--sf-muted-text)">
                        Thank you! We've received your quote request and will be in touch soon.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="mt-6 text-sm font-medium text-(--sf-accent) hover:opacity-80"
                    >
                        Submit another quote request
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
            <h1 className="text-3xl font-bold tracking-tight text-(--sf-text) sm:text-4xl">
                Request a Quote
            </h1>
            <p className="mt-2 text-sm text-(--sf-muted-text)">
                Add products to your quote list and submit your details for a personalised quote.
            </p>

            <div className="mt-10 grid gap-10 lg:grid-cols-2">
                {/* Products to quote — on lg the column's height comes from the
                    form (absolute fill keeps it out of the row-height calculation),
                    so the list grows naturally until it reaches the form's height,
                    then scrolls instead of stretching the page. On mobile it grows
                    to a max-h cap. */}
                {/* min-w-0: grid items default to min-width:auto, which lets the
                    rows' nowrap text force the column wider than the viewport */}
                <section className="relative min-w-0" aria-labelledby="quote-products-heading">
                    <div className="flex flex-col lg:absolute lg:inset-0">
                        <h2
                            id="quote-products-heading"
                            className="text-lg font-semibold text-(--sf-text)"
                        >
                            Products to quote
                        </h2>

                        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-6">
                            {/* Product search — always visible, sits above the quote list */}
                            <QuoteProductSearch/>

                            {isEmpty ? (
                                <div
                                    className="rounded-lg border border-dashed border-(--sf-border) px-6 py-8 text-center">
                                    <p className="text-sm text-(--sf-muted-text)">
                                        No products in your quote list yet.
                                    </p>
                                </div>
                            ) : (
                                <div
                                    className="min-h-0 max-h-96 overflow-y-auto rounded-md border border-(--sf-border) bg-(--sf-panel) px-4 py-2 lg:max-h-none">
                                    <QuoteList/>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Your details — right area */}
                <section className="min-w-0" aria-labelledby="quote-details-heading">
                    <h2
                        id="quote-details-heading"
                        className="text-lg font-semibold text-(--sf-text)"
                    >
                        Your details
                    </h2>

                    <div className="mt-6 rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6">
                        <QuoteDetailsForm onSuccess={() => setSubmitted(true)}/>
                    </div>
                </section>
            </div>
        </div>
    )
}
