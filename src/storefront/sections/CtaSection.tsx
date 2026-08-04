import {Link} from 'react-router-dom'
import type {CtaSectionConfig} from '@/shared/types/StorefrontConfig'
import {
    ACCENT_BUTTON_HOVER,
    SECONDARY_BUTTON_HOVER_DARK,
    SF_FOCUS_RING_PAGE,
    Section,
    SectionEyebrow,
    SectionHeading,
} from './shared'

export function CtaSection({section}: { section: CtaSectionConfig }) {
    const {title, description, eyebrow, cta, secondaryCta, secondaryLinks = [], variant = 'accent'} = section.props

    // Dark variant composes the shared presentation system so the band matches
    // the standardized section look (Section dark frame + SectionHeading).
    // The accent variant keeps its own full-bleed accent band — SectionHeading's
    // accent tokens would be invisible on an accent background.
    if (variant === 'dark') {
        return (
            <Section variant="dark">
                {/* The action column stacks and self-sizes to its widest label, so
                    both buttons match without a hardcoded width that a different
                    client's wording would break — and the copy keeps everything
                    else, which is the wider column of the two. */}
                <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
                    <SectionHeading eyebrow={eyebrow} title={title} subtitle={description} className="lg:mb-0"/>
                    <div className="mt-8 flex flex-col items-stretch gap-3 lg:mt-0 lg:shrink-0">
                    <Link
                        to={cta.to}
                        className={`block rounded-md border-2 border-transparent bg-(--sf-accent) px-6 py-3 text-center text-sm font-semibold text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`}
                    >
                        {cta.label}
                    </Link>
                    {secondaryCta && (
                        <Link
                            to={secondaryCta.to}
                            className={`block rounded-md border-2 border-(--sf-accent) bg-transparent px-6 py-3 text-center text-sm font-semibold transition-colors ${SECONDARY_BUTTON_HOVER_DARK} ${SF_FOCUS_RING_PAGE}`}
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
                    <SectionEyebrow tone="onAccent" align="center" className="mb-2">
                        {eyebrow}
                    </SectionEyebrow>
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
                            className={`inline-block rounded-md border-2 bg-transparent px-6 py-3 text-sm font-semibold transition-colors ${SECONDARY_BUTTON_HOVER_DARK}`}
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
