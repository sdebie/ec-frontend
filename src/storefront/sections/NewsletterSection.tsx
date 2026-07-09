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
                <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                {description && (
                    <p className="mt-4 text-lg text-gray-600">{description}</p>
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
                            'rounded-md border border-gray-300 px-4 py-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
                            layout === 'inline' ? 'flex-1' : 'w-full',
                        )}
                    />
                    <button
                        type="submit"
                        className={cn(
                            'rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500',
                            layout === 'stacked' && 'w-full',
                        )}
                    >
                        {submitLabel}
                    </button>
                </form>
                {legalText && (
                    <p className="mt-4 text-xs text-gray-500">{legalText}</p>
                )}
                {secondaryLink && (
                    <Link
                        to={secondaryLink.to}
                        className="mt-4 inline-block text-sm text-indigo-600 underline hover:text-indigo-500"
                    >
                        {secondaryLink.label}
                    </Link>
                )}
            </div>
        </section>
    )
}
