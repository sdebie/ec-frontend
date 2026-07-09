import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

interface DeleteBrandVariables {
  id: string
}

const DELETE_BRAND = gql`
  mutation DeleteBrand($id: String!) {
    deleteBrand(id: $id)
  }
`

export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: DeleteBrandVariables) =>
      adminGraphqlClient.request(DELETE_BRAND, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brand-list'] })
    },
  })
}
