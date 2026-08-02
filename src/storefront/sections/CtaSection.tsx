import {Link} from 'react-router-dom'
import type {CtaSectionConfig} from '@/shared/types/StorefrontConfig'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE, Section, SectionHeading} from './shared'

export function CtaSection({section}: { section: CtaSectionConfig }) {
    const {title, description, eyebrow, cta, secondaryCta, secondaryLinks = [], variant = 'accent'} = section.props

    // Dark variant composes the shared presentation system so the band matches
    // the standardized section look (Section dark frame + SectionHeading).
    // The accent variant keeps its own full-bleed accent band — SectionHeading's
    // accent tokens would be invisible on an accent background.
    if (variant === 'dark') {
        return (
            <Section variant="dark">
                <div className="lg:flex lg:items-center lg:justify-between lg:gap-12">
                    <SectionHeading eyebrow={eyebrow} title={title} subtitle={description} className="lg:mb-0"/>
                    <div className="flex flex-wrap items-center gap-4 lg:shrink-0">
                    <Link
                        to={cta.to}
                        className={`inline-block rounded-md border-2 border-transparent bg-(--sf-accent) px-6 py-3 text-sm font-semibold text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`}
                    >
                        {cta.label}
                    </Link>
                    {secondaryCta && (
                        <Link
                            to={secondaryCta.to}
                            className="inline-block rounded-md border-2 border-(--sf-accent) bg-transparent px-6 py-3 text-sm font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--sf-accent)_80%,white)] hover:text-(--sf-accent-text)"
                        >
                            {secondaryCta.label}
                        </Link>
                    )}
                    </div>
                </div>
                {secondaryLinks.length > 0 && (
                    <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Related links">
                        {secondaryLinks.map((link) => (
                            <Link
                                key={`${link.label}-${link.to}`}
                                to={link.to}
                                className="text-sm font-medium underline underline-offset-4"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                )}
            </Section>
        )
    }

    return (
        <section
            className="py-16 px-6 sm:px-8 text-center"
            style={{ background: 'var(--sf-accent)' }}
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
                        className="inline-block rounded-md border-2 border-transparent px-6 py-3 text-sm font-semibold shadow-sm"
                        style={{ background: 'var(--sf-accent-text)', color: 'var(--sf-accent)' }}
                    >
                        {cta.label}
                    </Link>
                    {secondaryCta && (
                        <Link
                            to={secondaryCta.to}
                            className="inline-block rounded-md border-2 bg-transparent px-6 py-3 text-sm font-semibold"
                            style={{ borderColor: 'var(--sf-accent-text)', color: 'var(--sf-accent-text)' }}
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
