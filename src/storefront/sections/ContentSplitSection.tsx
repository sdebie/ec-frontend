import {useState} from 'react'
import {Link} from 'react-router-dom'
import type {ContentSplitSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {Section} from './shared/Section'
import {SectionHeading} from './shared/SectionHeading'

export function ContentSplitSection({section}: { section: ContentSplitSectionConfig }) {
    const {eyebrow, title, paragraphs, cards, footnote, imageUrl, imageAlt, imagePosition = 'left'} = section.props

    const [imageFailed, setImageFailed] = useState(false)

    if (!paragraphs || paragraphs.length === 0) return null

    const resolvedImage = imageUrl ? resolveImageUrl(imageUrl) : null
    const showImage = resolvedImage && !imageFailed
    const isImageRight = imagePosition === 'right'

    return (
        <Section width="default">
            <SectionHeading title={title} eyebrow={eyebrow}/>

            {showImage ? (
                <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                    <div className={isImageRight ? 'md:order-2' : ''}>
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-(--sf-surface-muted)">
                            <img
                                src={resolvedImage}
                                alt={imageAlt ?? ''}
                                loading="lazy"
                                onError={() => setImageFailed(true)}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    <div className={isImageRight ? 'md:order-1' : ''}>
                        <div className="max-w-prose space-y-4">
                            {paragraphs.map((paragraph, index) => (
                                <p key={index} className="leading-relaxed text-(--sf-muted-text)">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // No image: paragraphs take the full section width. A prose-capped
                // column would leave the right half of the band empty.
                <div className="space-y-4">
                    {paragraphs.map((paragraph, index) => (
                        <p key={index} className="leading-relaxed text-(--sf-muted-text)">
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}

            {cards && cards.length > 0 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {cards.map((card) => (
                        <article
                            key={card.title}
                            className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-(--sf-shadow-sm)"
                        >
                            <div className="flex items-center gap-3">
                                {card.badge && (
                                    <span
                                        aria-hidden="true"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-(--sf-accent) text-lg font-bold text-(--sf-accent-text)"
                                    >
                                        {card.badge}
                                    </span>
                                )}
                                <h3 className="text-lg font-semibold text-(--sf-text)">{card.title}</h3>
                            </div>
                            <div className="mt-4 space-y-3">
                                {card.paragraphs.map((paragraph, index) => (
                                    <p key={index} className="text-sm leading-relaxed text-(--sf-muted-text)">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {footnote && footnote.length > 0 && (
                <p className="mt-6 text-sm leading-relaxed text-(--sf-muted-text)">
                    {footnote.map((segment, index) =>
                        segment.to ? (
                            <Link
                                key={index}
                                to={segment.to}
                                className="font-medium text-(--sf-accent) hover:underline"
                            >
                                {segment.text}
                            </Link>
                        ) : (
                            <span key={index}>{segment.text}</span>
                        )
                    )}
                </p>
            )}
        </Section>
    )
}
