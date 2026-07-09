import { useMutation } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { ProductStatus } from '@/shared/types/enums'

export interface VariantPayload {
  id?: string
  sku: string
  price: string
  stock: number
}

export interface ProductPayload {
  name: string
  slug: string
  shortDescription: string
  description: string
  status: ProductStatus
  categoryId: string
  images: string[]
  variants: VariantPayload[]
}

export function useCreateProduct() {
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const { data } = await adminHttpClient.post('/admin/products', payload)
      return data
    },
  })

  return { mutate, isLoading: isPending }
}
