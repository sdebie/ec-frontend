import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {BrandDetail} from '../types'

interface BrandResponse {
    brand: BrandDetail | null
}

const GET_BRAND = gql`
    query GetBrand($id: String!) {
        brand(id: $id) {
            id
            name
            slug
            description
            logoUrl
        }
    }
`

export function useBrandDetail(brandId: string) {
    const {data, isLoading, error} = useQuery({
        queryKey: ['admin-brand', brandId],
        queryFn: () =>
            adminGraphqlClient.request<BrandResponse>(GET_BRAND, {id: brandId}),
        enabled: !!brandId,
    })

    return {
        data: data?.brand ?? undefined,
        isLoading,
        error,
    }
}
