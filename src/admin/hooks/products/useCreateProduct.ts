import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { toProductInformationInput } from './mappers'
import type { ProductPayload } from './types'

export type { ProductPayload, AdminProductVariant, ProductImagePayload, VariantAttribute } from './types'

// --- Response types ---

interface ProductInformationResponse {
  addProductInformation: {
    product: { id: string; name: string; slug: string; status: string }
    variants: Array<{
      id: string
      sku: string
      stockQuantity: number
      prices: Array<{ id: string; priceType: string; price: string }>
      images: Array<{ id: string; imageUrl: string; featured: boolean; sortOrder: number }>
    }>
  }
}

// --- Mutation document ---

const ADD_PRODUCT_INFORMATION = gql`
  mutation AddProductInformation($input: ProductInformationDtoInput) {
    addProductInformation(input: $input) {
      product { id name slug status }
      variants { id sku stockQuantity prices { id priceType price } images { id imageUrl featured sortOrder } }
    }
  }
`

export function useCreateProduct() {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending } = useMutation<ProductInformationResponse, Error, ProductPayload>({
    mutationFn: (payload: ProductPayload) => {
      const input = toProductInformationInput(payload)
      return adminGraphqlClient.request<ProductInformationResponse>(ADD_PRODUCT_INFORMATION, { input })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product-stats'] })
    },
    onError: () => {
      toast.error('Failed to create product', { duration: 0 })
    },
  })

  return { mutate, mutateAsync, isLoading: isPending }
}
