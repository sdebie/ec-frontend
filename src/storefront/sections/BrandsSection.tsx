import {useState} from 'react'
import {Link} from 'react-router-dom'
import type {BrandsSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {useBrands} from '@/storefront/catalog/hooks/useBrands'
import {Section, SectionHeading} from './shared'

interface BrandTileProps {
    name: string
    slug: string
    logoUrl: string | null
}

function BrandTile({name, slug, logoUrl}: BrandTileProps) {
    const [imgFailed, setImgFailed] = useState(false)
    const src = resolveImageUrl(logoUrl)
    const showImage = src && !imgFailed

    return (
        <Link
            to={`/products?brand=${encodeURIComponent(slug)}`}
            aria-label={`Shop ${name} products`}
            className="flex h-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-(--sf-border) bg-(--sf-panel) p-3 transition-all hover:-translate-y-0.5 hover:border-(--sf-accent) hover:bg-[color-mix(in_srgb,var(--sf-accent)_8%,var(--sf-panel))] hover:shadow-md sm:h-16 sm:p-4 lg:h-20">
            {showImage ? (
                <img
                    src={src}
                    alt={name}
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-contain"
                />
            ) : (
                <span className="text-center text-sm font-semibold text-(--sf-text)">
                    {name}
                </span>
            )}
        </Link>
    )
}

export function BrandsSection({section}: { section: BrandsSectionConfig }) {
    const {brands, isLoading} = useBrands()

    const {title, eyebrow, variant, limit, minItems = 1} = section.props

    if (isLoading && brands.length === 0) return null
    if (brands.length < minItems) return null

    const displayBrands = limit ? brands.slice(0, limit) : brands

    return (
        <Section variant={variant} className="py-10">
            {title && <SectionHeading title={title} eyebrow={eyebrow} className="mb-4"/>}
            <div
                className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-6 lg:gap-3">
                {displayBrands.map((brand) => (
                    <BrandTile key={brand.id} name={brand.name} slug={brand.slug} logoUrl={brand.logoUrl}/>
                ))}
            </div>
        </Section>
    )
}
