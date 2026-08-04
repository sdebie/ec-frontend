import {useState} from 'react'
import type {AccreditorsSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {SECTION_WIDTH_CLASS, Section, SectionHeading} from './shared'

interface AccreditorTileProps {
    name: string
    logoUrl: string
    url?: string
}

// Tiles fill their GRID CELL rather than carrying a fixed width, so the artwork
// inside can grow with the room the row has.
//
// The height comes from an ASPECT RATIO, not a fixed value, so a tile keeps its
// proportions at every width and the logos scale with the viewport.
//
// The ratio is a guard against mismatched uploads: with artwork of differing
// shapes, `object-contain` leaves some logos height-bound and some width-bound,
// which makes them look like different sizes. A tile wider than any logo it
// holds keeps them consistent whatever a client uploads.
//
// The `max-w` cap keeps a phone tile narrower than a desktop one, which is a
// third of the row (368px at the standard page width). It is NOT there to leave
// a gutter: a single-column tile should very nearly fill the phone's content
// column, or the logos read as small with dead space either side. 320px lands
// within a few px of full width on a 375px phone and still sits under the
// desktop tile, so the cap only bites on large phones.
//
// The class goes on the OUTER element, not the bordered box: when a tile is
// wrapped in its link, a percentage width on the inner div would resolve against
// a shrink-to-fit anchor and collapse.
const TILE_SIZE_CLASS = 'mx-auto w-full max-w-[320px] aspect-[5/2] sm:max-w-none'

function AccreditorTile({name, logoUrl, url}: AccreditorTileProps) {
    const [imgFailed, setImgFailed] = useState(false)
    const src = resolveImageUrl(logoUrl)
    const showImage = src && !imgFailed

    const box = (
        <div
            // Padding trimmed to `p-2` at every size: the logo is meant to take
            // the tile's full height and width, and a 16px inset was throwing
            // away ~18% of the available height on a 176px tile.
            className="flex h-full w-full items-center justify-center rounded-md border border-(--sf-border) bg-(--sf-panel) p-2">
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
            {/* A real grid, not a wrapping flex row: every tile then gets an
                equal share of the width and the logos scale with the viewport.
                One column on a phone so they flow under each other at full
                width — three across a 375px screen left each logo ~98px, which
                is smaller than the text beside it. `items-stretch` (the grid
                default) is what lets a tile fill its cell. */}
            <div
                data-testid="accreditors-grid"
                // Full content width rather than a narrower cap: the logos are
                // width-bound, so the grid CELL is effectively the logo size.
                // Letting the row use the section's own width is what makes them
                // bigger on desktop.
                className={`mx-auto grid ${SECTION_WIDTH_CLASS.default} grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6`}
            >
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
