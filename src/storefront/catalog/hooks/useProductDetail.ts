import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'

// --- Raw schema types (match actual ProductInformationDto shape) ---

interface RawPrice {
  priceType: string
  price: number | null
}

interface RawImage {
  id: string
  imageUrl: string
  featured: boolean
  sortOrder: number
}

interface RawVariant {
  id: string
  stockQuantity: number | null
  attributesJson: string
  images: RawImage[]
  prices: RawPrice[]
}

interface RawProduct {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  category: { id: string; name: string; slug: string } | null
  brand: { id: string; name: string } | null
}

interface RawProductInformation {
  product: RawProduct
  variants: RawVariant[]
}

interface GetProductInformationBySlugResponse {
  getProductInformationBySlug: RawProductInformation | null
}

// --- Flat types consumed by ProductDetailPage (unchanged) ---

interface ProductImage {
  id: string
  imageUrl: string
  featured: boolean
  sortOrder: number
}

interface ProductVariant {
  id: string
  retailPrice: number | null
  wholesalePrice: number | null
  retailSalePrice: number | null
  wholesaleSalePrice: number | null
  stockQuantity: number | null
  attributesJson: string
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  category: { id: string; name: string; slug: string } | null
  brand: { id: string; name: string } | null
  images: ProductImage[]
  variants: ProductVariant[]
}

// --- Query ---

const GET_PRODUCT_BY_SLUG = gql`
  query GetProductInformationBySlug($slug: String!) {
    getProductInformationBySlug(slug: $slug) {
      product {
        id
        name
        slug
        shortDescription
        description
        category {
          id
          name
          slug
        }
        brand {
          id
          name
        }
      }
      variants {
        id
        stockQuantity
        attributesJson
        images {
          id
          imageUrl
          featured
          sortOrder
        }
        prices {
          priceType
          price
        }
      }
    }
  }
`

// --- Transform raw schema response → flat ProductDetail shape ---

function transform(raw: RawProductInformation): ProductDetail {
  // Collect all images from all variants, dedup by id, sort by sortOrder
  const seen = new Set<string>()
  const images: ProductImage[] = raw.variants
    .flatMap((v) => v.images ?? [])
    .filter((img) => (seen.has(img.id) ? false : (seen.add(img.id), true)))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  // Map each variant's prices array to flat numeric fields
  const variants: ProductVariant[] = raw.variants.map((v) => {
    const priceMap: Record<string, number | null> = {}
    for (const p of v.prices ?? []) {
      priceMap[p.priceType] = p.price
    }
    return {
      id: v.id,
      retailPrice: priceMap['RETAIL_PRICE'] ?? null,
      wholesalePrice: priceMap['WHOLESALE_PRICE'] ?? null,
      retailSalePrice: priceMap['RETAIL_SALE_PRICE'] ?? null,
      wholesaleSalePrice: priceMap['WHOLESALE_SALE_PRICE'] ?? null,
      stockQuantity: v.stockQuantity ?? null,
      attributesJson: v.attributesJson ?? '{}',
    }
  })

  return {
    ...raw.product,
    images,
    variants,
  }
}

// --- Hook ---

export function useProductDetail(slug: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: () =>
      graphqlClient.request<GetProductInformationBySlugResponse>(GET_PRODUCT_BY_SLUG, {
        slug,
      }),
    enabled: !!slug,
  })

  const raw = data?.getProductInformationBySlug
  const product = raw ? transform(raw) : null

  return {
    product,
    isLoading,
    isError,
  }
}
