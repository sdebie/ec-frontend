import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

export interface CreateBrandPayload {
  name: string
  slug: string
  description?: string
  logoUrl?: string
}

const CREATE_BRAND = gql`
  mutation CreateBrand($brandDto: BrandDtoInput!) {
    createBrand(brandDto: $brandDto)
  }
`

export function useCreateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBrandPayload) =>
      adminGraphqlClient.request(CREATE_BRAND, { brandDto: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brand-list'] })
    },
  })
}
