import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

interface UpdateProductStatusVariables {
  id: string
  status: string
}

const UPDATE_PRODUCT_STATUS = gql`
  mutation UpdateProductStatus($id: String!, $status: String!) {
    updateProductStatus(id: $id, status: $status)
  }
`

export function useUpdateProductStatusGql() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: UpdateProductStatusVariables) =>
      adminGraphqlClient.request(UPDATE_PRODUCT_STATUS, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products-list'] })
      queryClient.invalidateQueries({ queryKey: ['admin-product-stats'] })
    },
  })
}
