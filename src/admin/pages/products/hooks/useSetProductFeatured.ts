import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { toast } from '@/shared/ui/components/toast'

export interface SetProductFeaturedVariables {
  productId: string
  featured: boolean
}

export interface SetProductFeaturedResponse {
  setProductFeatured: {
    productId: string
    featured: boolean
  }
}

export const SET_PRODUCT_FEATURED = gql`
  mutation SetProductFeatured($productId: String!, $featured: Boolean!) {
    setProductFeatured(productId: $productId, featured: $featured) {
      productId
      featured
    }
  }
`

export function useSetProductFeatured() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: SetProductFeaturedVariables) =>
      adminGraphqlClient.request<SetProductFeaturedResponse>(SET_PRODUCT_FEATURED, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-products'] })
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to update featured status')
    },
  })
}
