import type {AccreditorsSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'

export function AccreditorsSection({section}: { section: AccreditorsSectionConfig }) {
    const {heading, items} = section.props

    if (items.length === 0) return null

    return (
        <section className="py-12 px-6 sm:px-8">
            {heading && (
                <h2 className="mb-6 text-center text-2xl font-semibold">{heading}</h2>
            )}
            <div className="flex flex-wrap justify-center gap-8">
                {items.map((item) => {
                    const src = resolveImageUrl(item.logoUrl)
                    if (!src) return null

                    const img = (
                        <img
                            key={item.id}
                            src={src}
                            alt={item.name}
                            className="h-12 w-auto object-contain"
                        />
                    )

                    if (item.url) {
                        return (
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {img}
                            </a>
                        )
                    }

                    return img
                })}
            </div>
        </section>
    )
}
