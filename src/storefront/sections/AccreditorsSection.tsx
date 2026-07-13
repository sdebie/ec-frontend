import {useState} from 'react'
import type {AccreditorsSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'

interface AccreditorTileProps {
    name: string
    logoUrl: string
    url?: string
}

function AccreditorTile({name, logoUrl, url}: AccreditorTileProps) {
    const [imgFailed, setImgFailed] = useState(false)
    const src = resolveImageUrl(logoUrl)
    const showImage = src && !imgFailed

    const tile = (
        <div
            className="flex h-20 w-40 items-center justify-center rounded-md border border-(--sf-border) bg-(--sf-panel) p-2 sm:h-24 sm:w-48 sm:p-3 lg:h-28 lg:w-56">
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-contain"
                />
            ) : (
                <span className="text-center text-sm font-medium text-(--sf-text) px-2">
                    {name}
                </span>
            )}
        </div>
    )

    if (url) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="outline-none focus-visible:ring-2 focus-visible:ring-(--sf-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--sf-background) rounded-md"
            >
                {tile}
            </a>
        )
    }

    return tile
}

export function AccreditorsSection({section}: { section: AccreditorsSectionConfig }) {
    const {heading, items} = section.props

    if (items.length === 0) return null

    return (
        <section className="py-12 px-6 sm:px-8">
            {heading && (
                <h2 className="mb-6 text-2xl font-semibold">{heading}</h2>
            )}
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 sm:gap-5">
                {items.map((item) => (
                    <AccreditorTile
                        key={item.id}
                        name={item.name}
                        logoUrl={item.logoUrl}
                        url={item.url}
                    />
                ))}
            </div>
        </section>
    )
}
