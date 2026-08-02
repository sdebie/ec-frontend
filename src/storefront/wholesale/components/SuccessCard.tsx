import {Link} from 'react-router-dom'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from '@/storefront/sections/shared'

export function SuccessCard() {
    return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
            <div className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-8 shadow-sm">
                <div
                    className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--c-success)/10">
                    <svg
                        className="h-6 w-6 text-(--c-success)"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-(--sf-text)">
                    Application submitted
                </h2>
                <p className="mt-3 text-(--sf-muted-text)">
                    Thank you. Your wholesale application has been received. We will review your details and
                    contact you within 2–3 business days.
                </p>
                <p className="mt-2 text-sm text-(--sf-muted-text)">
                    Once approved, you will receive an email with a link to set your password and access your
                    wholesale account.
                </p>
                <Link
                    to="/"
                    className={`mt-6 inline-block rounded-md bg-(--sf-accent) px-5 py-2.5 text-sm font-medium text-(--sf-accent-text) transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`}
                >
                    Return to home
                </Link>
            </div>
        </div>
    )
}
