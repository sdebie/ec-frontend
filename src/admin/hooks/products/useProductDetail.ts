import { useQuery } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { ProductStatus } from '@/shared/types/enums'

export interface AdminProductVariant {
  id: string
  sku: string
  price: string
  stock: number
}

export interface AdminProductDetail {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  status: ProductStatus
  category: { id: string; name: string }
  images: string[]
  variants: AdminProductVariant[]
}

export function useProductDetail(productId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'products', productId],
    queryFn: async () => {
      const response = await adminHttpClient.get<AdminProductDetail>(
        `/admin/products/${productId}`,
      )

      return response.data
    },
    enabled: !!productId,
  })

  return { data, isLoading, error }
}
