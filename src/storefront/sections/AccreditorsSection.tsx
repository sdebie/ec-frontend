import {useState} from 'react'
import type {AccreditorsSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {Section, SectionHeading} from './shared'

interface AccreditorTileProps {
    name: string
    logoUrl: string
    url?: string
}

// Below `sm` a tile takes a third of the row minus its share of the TWO gaps
// between three tiles, so up to three accreditors sit on ONE line instead of
// stacking into a 3-high tower — a 208px fixed tile could not fit beside
// anything on a 375px phone. More than three still wraps (the container is
// flex-wrap), so this scales with whatever a client seeds rather than assuming
// three. From `sm` the original fixed sizes return unchanged.
//
// The class goes on the OUTER element, not the bordered box: when a tile is
// wrapped in its link, a percentage width on the inner div would resolve against
// a shrink-to-fit anchor and collapse.
const TILE_SIZE_CLASS = 'w-[calc((100%-2rem)/3)] h-20 sm:h-32 sm:w-64 lg:h-36 lg:w-72'

function AccreditorTile({name, logoUrl, url}: AccreditorTileProps) {
    const [imgFailed, setImgFailed] = useState(false)
    const src = resolveImageUrl(logoUrl)
    const showImage = src && !imgFailed

    const box = (
        <div
            className="flex h-full w-full items-center justify-center rounded-md border border-(--sf-border) bg-(--sf-panel) p-2 sm:p-4">
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-contain"
                />
            ) : (
                <span className="text-center text-xs font-medium text-(--sf-text) px-1 sm:text-sm sm:px-2">
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
                className={`${TILE_SIZE_CLASS} rounded-md outline-none focus-visible:ring-2 focus-visible:ring-(--sf-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--sf-background)`}
            >
                {box}
            </a>
        )
    }

    return <div className={TILE_SIZE_CLASS}>{box}</div>
}

export function AccreditorsSection({section}: { section: AccreditorsSectionConfig }) {
    const {title, eyebrow, variant, items} = section.props

    if (items.length === 0) return null

    return (
        <Section variant={variant}>
            {title && <SectionHeading title={title} eyebrow={eyebrow} />}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
                {items.map((item) => (
                    <AccreditorTile
                        key={item.id}
                        name={item.name}
                        logoUrl={item.logoUrl}
                        url={item.url}
                    />
                ))}
            </div>
        </Section>
    )
}
