import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

export interface UpdateCategoryPayload {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parent?: { id: string } | null
}

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $categoryDto: CategoryDtoInput!) {
    updateCategory(id: $id, categoryDto: $categoryDto)
  }
`

export function useUpdateCategory(categoryId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateCategoryPayload) =>
      adminGraphqlClient.request(UPDATE_CATEGORY, { id: categoryId, categoryDto: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-category-list'] })
      queryClient.invalidateQueries({ queryKey: ['admin-category'] })
    },
  })
}
