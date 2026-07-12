import {Link} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import type {NewsletterSectionConfig} from '@/shared/types/StorefrontConfig'

export function NewsletterSection({section}: { section: NewsletterSectionConfig }) {
    const {
        title,
        submitLabel,
        description,
        placeholder = 'Your email address',
        legalText,
        secondaryLink,
        layout = 'stacked',
    } = section.props

    return (
        <section className="py-16 px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold text-(--sf-text)">{title}</h2>
                {description && (
                    <p className="mt-4 text-lg text-(--sf-muted-text)">{description}</p>
                )}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className={cn(
                        'mt-8',
                        layout === 'inline'
                            ? 'flex flex-col sm:flex-row gap-3'
                            : 'flex flex-col gap-3',
                    )}
                >
                    <input
                        type="email"
                        required
                        placeholder={placeholder}
                        className={cn(
                            'rounded-md border border-(--sf-border) px-4 py-3 text-sm placeholder-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)',
                            layout === 'inline' ? 'flex-1' : 'w-full',
                        )}
                    />
                    <button
                        type="submit"
                        className={cn(
                            'rounded-md bg-(--sf-accent) px-6 py-3 text-sm font-semibold text-(--sf-accent-text) shadow-sm hover:opacity-90',
                            layout === 'stacked' && 'w-full',
                        )}
                    >
                        {submitLabel}
                    </button>
                </form>
                {legalText && (
                    <p className="mt-4 text-xs text-(--sf-muted-text)">{legalText}</p>
                )}
                {secondaryLink && (
                    <Link
                        to={secondaryLink.to}
                        className="mt-4 inline-block text-sm text-(--sf-accent) underline hover:opacity-90"
                    >
                        {secondaryLink.label}
                    </Link>
                )}
            </div>
        </section>
    )
}
