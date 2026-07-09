import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

interface DeleteProductVariables {
  id: string
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
      adminGraphqlClient.request(DELETE_PRODUCT, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product-stats'] })
    },
  })
}
