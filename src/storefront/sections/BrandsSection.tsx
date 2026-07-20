import {useState} from 'react'
import type {BrandsSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {useBrands} from '@/storefront/catalog/hooks/useBrands'

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
            className="flex h-16 items-center justify-center rounded-md border border-(--sf-border) bg-(--sf-panel) p-2 sm:h-20 sm:p-3 lg:h-24">
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-contain"
                />
            ) : (
                <span className="text-center text-sm font-medium text-(--sf-text)">
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

    const {heading, limit} = section.props
    const displayBrands = limit ? brands.slice(0, limit) : brands

    return (
        <section className="py-8 px-6 sm:px-8">
            {heading && (
                <h2 className="mb-4 text-center text-lg font-semibold">{heading}</h2>
            )}
            <div
                className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
                {displayBrands.map((brand) => (
                    <BrandTile key={brand.id} name={brand.name} logoUrl={brand.logoUrl}/>
                ))}
            </div>
        </section>
    )
}
