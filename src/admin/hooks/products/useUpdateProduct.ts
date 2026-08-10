import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { toProductInformationInput } from './mappers'
import type { ProductPayload } from './types'

// --- Response types ---

interface UpdateProductInformationResponse {
  updateProductInformation: {
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

export const UPDATE_PRODUCT_INFORMATION = gql`
  mutation UpdateProductInformation($productId: String!, $input: ProductInformationDtoInput) {
    updateProductInformation(productId: $productId, input: $input) {
      product { id name slug status }
      variants { id sku stockQuantity prices { id priceType price } images { id imageUrl featured sortOrder } }
    }
  }
`

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending } = useMutation<UpdateProductInformationResponse, Error, ProductPayload>({
    mutationFn: (payload: ProductPayload) => {
      const input = toProductInformationInput(payload)
      return adminGraphqlClient.request<UpdateProductInformationResponse>(UPDATE_PRODUCT_INFORMATION, {
        productId,
        input,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product-stats'] })
    },
    onError: (error) => {
      console.error('[ProductWrite] action failed:', error)
      toast.error('Failed to save product', { duration: 0 })
    },
  })

  return { mutate, mutateAsync, isLoading: isPending }
}
