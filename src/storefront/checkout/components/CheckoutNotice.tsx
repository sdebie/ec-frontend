import {Link} from 'react-router-dom'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from '@/storefront/sections/shared'

interface CheckoutNoticeProps {
    heading: string
    body: string
    action?: { label: string; to: string }
    /** Rendered above the heading — a spinner while a payment is being confirmed. */
    busy?: boolean
}

/**
 * The panel every non-form checkout state uses: expired session, invalid link,
 * payment pending, confirmation. One panel, styled like the cart's empty state
 * and rendered inside the shared shell, so no state gets its own `h1`
 * competing with the page heading.
 */
export function CheckoutNotice({heading, body, action, busy = false}: CheckoutNoticeProps) {
    return (
        <div className="mt-6 rounded-lg border border-(--sf-border) bg-(--sf-panel) px-6 py-16 text-center">
            {busy && (
                <div className="mb-6 flex justify-center">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-4 border-(--sf-border) border-t-(--sf-accent)"
                        role="status"
                        aria-label="Confirming"
                    />
                </div>
            )}

            <h2 className="mb-2 text-xl font-semibold text-(--sf-text)">
                {heading}
            </h2>
            <p className="mx-auto max-w-md text-sm text-(--sf-muted-text)">
                {body}
            </p>

            {action && (
                <Link
                    to={action.to}
                    className={`mt-6 inline-block rounded-lg bg-(--sf-accent) px-6 py-3 font-medium text-(--sf-accent-text) transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`}
                >
                    {action.label}
                </Link>
            )}
        </div>
    )
}
