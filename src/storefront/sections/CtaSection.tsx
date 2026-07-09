import {Link} from 'react-router-dom'
import type {CtaSectionConfig} from '@/shared/types/StorefrontConfig'

export function CtaSection({section}: { section: CtaSectionConfig }) {
    const {title, description, cta, variant = 'accent'} = section.props

    const isDark = variant === 'dark'
    const sectionStyle = isDark
        ? { background: 'linear-gradient(135deg, var(--c-surface-dark, #000) 0%, var(--c-surface-dark, #000) 55%, var(--c-accent) 140%)' }
        : { background: 'var(--c-accent)' }

    const buttonStyle = isDark
        ? { background: 'var(--c-accent-text)', color: 'var(--c-surface-dark, #000)' }
        : { background: 'var(--c-accent-text)', color: 'var(--c-accent)' }

    return (
        <section
            className="py-16 px-6 sm:px-8 text-center"
            style={sectionStyle}
        >
            <div className="mx-auto max-w-2xl">
                <h2
                    className="text-3xl font-bold"
                    style={{ color: 'var(--c-accent-text)' }}
                >
                    {title}
                </h2>
                {description && (
                    <p
                        className="mt-4 text-lg"
                        style={{ color: 'var(--c-accent-text)', opacity: 0.85 }}
                    >
                        {description}
                    </p>
                )}
                <Link
                    to={cta.to}
                    className="mt-8 inline-block rounded-md px-6 py-3 text-sm font-semibold shadow-sm"
                    style={buttonStyle}
                >
                    {cta.label}
                </Link>
            </div>
        </section>
    )
}
