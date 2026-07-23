import {useState} from 'react'
import type {BrandsSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {useBrands} from '@/storefront/catalog/hooks/useBrands'
import {Section, SectionHeading} from './shared'

interface BrandTileProps {
    name: string
    logoUrl: string | null
}

function BrandTile({name, logoUrl}: BrandTileProps) {
    const [imgFailed, setImgFailed] = useState(false)
    const src = resolveImageUrl(logoUrl)
    const showImage = src && !imgFailed

    return (
        <div
            className="flex h-16 items-center justify-center rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-3 sm:h-20 sm:p-4 lg:h-24">
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    onError={() => setImgFailed(true)}
                    className="max-h-full max-w-[75%] object-contain"
                />
            ) : (
                <span className="text-center text-sm font-semibold text-(--sf-text)">
                    {name}
                </span>
            )}
        </div>
    )
}

export function BrandsSection({section}: { section: BrandsSectionConfig }) {
    const {brands, isLoading} = useBrands()

    if (isLoading && brands.length === 0) return null
    if (brands.length === 0) return null

    const {title, eyebrow, limit} = section.props
    const displayBrands = limit ? brands.slice(0, limit) : brands

    return (
        <Section className="py-8">
            {title && <SectionHeading title={title} eyebrow={eyebrow} />}
            <div
                className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:gap-3">
                {displayBrands.map((brand) => (
                    <BrandTile key={brand.id} name={brand.name} logoUrl={brand.logoUrl}/>
                ))}
            </div>
        </Section>
    )
}
