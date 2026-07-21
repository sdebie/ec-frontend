import {Link} from 'react-router-dom'
import type {CtaSectionConfig} from '@/shared/types/StorefrontConfig'

export function CtaSection({section}: { section: CtaSectionConfig }) {
    const {title, description, eyebrow, cta, secondaryCta, secondaryLinks = [], variant = 'accent'} = section.props

    const isDark = variant === 'dark'
    const sectionStyle = isDark
        ? { background: 'linear-gradient(135deg, var(--sf-nav-background, #000) 0%, var(--sf-nav-background, #000) 55%, var(--sf-accent) 140%)' }
        : { background: 'var(--sf-accent)' }

    const buttonStyle = isDark
        ? { background: 'var(--sf-accent-text)', color: 'var(--sf-nav-background, #000)' }
        : { background: 'var(--sf-accent-text)', color: 'var(--sf-accent)' }

    const outlinedButtonStyle = isDark
        ? { borderColor: 'var(--sf-accent-text)', color: 'var(--sf-accent-text)' }
        : { borderColor: 'var(--sf-accent-text)', color: 'var(--sf-accent-text)' }

    return (
        <section
            className="py-16 px-6 sm:px-8 text-center"
            style={sectionStyle}
        >
            <div className="mx-auto max-w-2xl">
                {eyebrow && (
                    <p
                        className="text-xs font-semibold uppercase tracking-widest mb-2"
                        style={{ color: 'var(--sf-accent-text)', opacity: 0.7 }}
                    >
                        {eyebrow}
                    </p>
                )}
                <h2
                    className="text-3xl font-bold"
                    style={{ color: 'var(--sf-accent-text)' }}
                >
                    {title}
                </h2>
                {description && (
                    <p
                        className="mt-4 text-lg"
                        style={{ color: 'var(--sf-accent-text)', opacity: 0.85 }}
                    >
                        {description}
                    </p>
                )}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Link
                        to={cta.to}
                        className="inline-block rounded-md px-6 py-3 text-sm font-semibold shadow-sm"
                        style={buttonStyle}
                    >
                        {cta.label}
                    </Link>
                    {secondaryCta && (
                        <Link
                            to={secondaryCta.to}
                            className="inline-block rounded-md border-2 bg-transparent px-6 py-3 text-sm font-semibold"
                            style={outlinedButtonStyle}
                        >
                            {secondaryCta.label}
                        </Link>
                    )}
                </div>
                {secondaryLinks.length > 0 && (
                    <nav className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Related links">
                        {secondaryLinks.map((link) => (
                            <Link
                                key={`${link.label}-${link.to}`}
                                to={link.to}
                                className="text-sm font-medium underline underline-offset-4"
                                style={{color: 'var(--sf-accent-text)'}}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                )}
            </div>
        </section>
    )
}
