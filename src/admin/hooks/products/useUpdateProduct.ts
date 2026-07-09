import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { ProductStatus } from '@/shared/types/enums'

interface VariantPayload {
  id?: string
  sku: string
  price: string
  stock: number
}

interface ProductPayload {
  name: string
  slug: string
  shortDescription: string
  description: string
  status: ProductStatus
  categoryId: string
  images: string[]
  variants: VariantPayload[]
}

export function useUpdateProduct(productId: string) {
  const { mutate, isPending } = useMutation<void, AxiosError, ProductPayload>({
    mutationFn: (payload: ProductPayload) =>
      adminHttpClient
        .put(`/admin/products/${productId}`, payload)
        .then(() => undefined),
  })

  return { mutate, isLoading: isPending }
}
