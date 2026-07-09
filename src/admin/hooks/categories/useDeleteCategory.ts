import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

interface DeleteCategoryVariables {
  id: string
}

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id)
  }
`

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: DeleteCategoryVariables) =>
      adminGraphqlClient.request(DELETE_CATEGORY, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-category-list'] })
    },
  })
}
