import type { BrandsSectionConfig } from '@/shared/types/StorefrontConfig'
import { resolveImageUrl } from '@/shared/utils/imageUrl'
import { useBrands } from '@/storefront/catalog/hooks/useBrands'

export function BrandsSection({ section }: { section: BrandsSectionConfig }) {
  const { brands, isLoading } = useBrands()

  if (isLoading && brands.length === 0) return null
  if (brands.length === 0) return null

  const { heading, limit } = section.props
  const displayBrands = limit ? brands.slice(0, limit) : brands

  return (
    <section className="py-12 px-6 sm:px-8">
      {heading && (
        <h2 className="mb-6 text-center text-2xl font-semibold">{heading}</h2>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {displayBrands.map((brand) => {
          const src = resolveImageUrl(brand.logoUrl)
          if (!src) return null

          return (
            <div key={brand.id} className="flex items-center justify-center">
              <img
                src={src}
                alt={brand.name}
                className="h-12 w-auto object-contain"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
