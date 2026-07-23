import {useState} from 'react'
import type {ContentSplitSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {Section} from './shared/Section'
import {SectionHeading} from './shared/SectionHeading'

export function ContentSplitSection({section}: { section: ContentSplitSectionConfig }) {
    const {eyebrow, title, paragraphs, imageUrl, imageAlt, imagePosition = 'left'} = section.props

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
                // No image: paragraphs take the full section width (owner call 2026-07-24 —
                // a prose-capped column left the right half of the band empty).
                <div className="space-y-4">
                    {paragraphs.map((paragraph, index) => (
                        <p key={index} className="leading-relaxed text-(--sf-muted-text)">
                            {paragraph}
                        </p>
                    ))}
                </div>
            )}
        </Section>
    )
}
