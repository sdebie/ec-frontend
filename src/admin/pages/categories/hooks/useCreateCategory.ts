import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { CreateCategoryPayload } from '../types'

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
