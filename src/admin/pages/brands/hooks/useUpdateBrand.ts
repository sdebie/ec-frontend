import {useMutation, useQueryClient} from '@tanstack/react-query'
import {gql} from 'graphql-request'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {UpdateBrandPayload} from '../types'

const UPDATE_BRAND = gql`
    mutation UpdateBrand($id: String!, $brandDto: BrandDtoInput!) {
        updateBrand(id: $id, brandDto: $brandDto)
    }
`

export function useUpdateBrand(brandId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: UpdateBrandPayload) =>
            adminGraphqlClient.request(UPDATE_BRAND, {id: brandId, brandDto: payload}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin-brand-list']})
            queryClient.invalidateQueries({queryKey: ['admin-brand']})
        },
    })
}
