import type {ContentSplitSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'

export function ContentSplitSection({section}: { section: ContentSplitSectionConfig }) {
    const {title, paragraphs, imageUrl, imageAlt, imagePosition = 'left'} = section.props

    if (!paragraphs || paragraphs.length === 0) return null

    const resolvedImage = imageUrl ? resolveImageUrl(imageUrl) : null
    const isImageRight = imagePosition === 'right'

    return (
        <section className="py-12 px-6 sm:px-8">
            <div
                className={
                    resolvedImage
                        ? 'mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-2'
                        : 'mx-auto max-w-3xl'
                }
            >
                {resolvedImage && (
                    <div className={isImageRight ? 'md:order-2' : ''}>
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-(--sf-surface-muted)">
                            <img
                                src={resolvedImage}
                                alt={imageAlt ?? ''}
                                loading="lazy"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                )}

                <div className={isImageRight ? 'md:order-1' : ''}>
                    <h2 className="text-2xl font-semibold text-(--sf-text)">{title}</h2>
                    <div className="mt-4 max-w-prose space-y-4">
                        {paragraphs.map((paragraph, index) => (
                            <p key={index} className="leading-relaxed text-(--sf-muted-text)">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
