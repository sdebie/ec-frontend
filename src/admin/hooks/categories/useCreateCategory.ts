import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

export interface CreateCategoryPayload {
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parent?: { id: string } | null
}

const CREATE_CATEGORY = gql`
  mutation CreateCategory($categoryDto: CategoryDtoInput!) {
    createCategory(categoryDto: $categoryDto)
  }
`

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      adminGraphqlClient.request(CREATE_CATEGORY, { categoryDto: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-category-list'] })
    },
  })
}
