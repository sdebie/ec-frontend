import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

interface DeleteProductVariables {
  id: string
}

/**
 * Order history is the only bar to physical deletion (ProductService.deleteProduct,
 * ec-backend): a product whose variants were never ordered is hard-deleted;
 * one with order references is archived instead, so orders keep their variant
 * rows. The mutation used to return void, so a caller had no way to tell which
 * happened — this type is the whole reason it doesn't anymore.
 */
export type ProductDeletionOutcome = 'DELETED' | 'ARCHIVED'

interface DeleteProductResponse {
  deleteProduct: ProductDeletionOutcome
}

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id)
  }
`

export function useDeleteProductGql() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: DeleteProductVariables) =>
      adminGraphqlClient.request<DeleteProductResponse>(DELETE_PRODUCT, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product-stats'] })
    },
  })
}
