import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'

interface Brand {
    id: string
    name: string
    slug: string
    logoUrl: string | null
}

interface StorefrontBrandsResponse {
    getBrands: {
        content: Brand[]
        totalElements: number
    }
}

const GET_BRANDS = gql`
    query StorefrontBrands($pageIndex: Int, $pageSize: Int) {
        getBrands(pageIndex: $pageIndex, pageSize: $pageSize) {
            content {
                id
                name
                slug
                logoUrl
            }
            totalElements
        }
    }
`

export function useBrands() {
    const {data, isLoading, isError} = useQuery({
        queryKey: ['catalog-brands'],
        queryFn: () =>
            graphqlClient.request<StorefrontBrandsResponse>(GET_BRANDS, {
                pageSize: 500,
            }),
        staleTime: 10 * 60 * 1000, // 10 minutes — brands rarely change
    })

    return {
        brands: data?.getBrands.content ?? [],
        isLoading,
        isError,
    }
}
