import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import {buildSearchFilterRequest, type FilterRequestInput, type SortItem} from '@/admin/utils'

export interface BrandListItem {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
}

interface GetBrandsResponse {
    getBrands: {
        content: BrandListItem[]
        totalElements: number
        totalPages: number
        pageIndex: number
        pageSize: number
    }
}

const GET_BRANDS = gql`
    query GetBrands($pageIndex: Int, $pageSize: Int, $filterRequest: FilterRequestInput) {
        getBrands(pageIndex: $pageIndex, pageSize: $pageSize, filterRequest: $filterRequest) {
            content {
                id
                name
                slug
                description
                logoUrl
            }
            totalElements
            totalPages
            pageIndex
            pageSize
        }
    }
`

export interface UseBrandListParams {
    pageIndex: number
    pageSize: number
    search?: string
    sort?: SortItem[]
}

export function useBrandList(params: UseBrandListParams) {
    const {pageIndex, pageSize, search = '', sort} = params

    const filterRequest: FilterRequestInput | undefined = buildSearchFilterRequest(search, sort)

    const {data, isLoading, error} = useQuery({
        queryKey: ['admin-brand-list', pageIndex, pageSize, search, sort],
        queryFn: () =>
            adminGraphqlClient.request<GetBrandsResponse>(GET_BRANDS, {
                pageIndex,
                pageSize,
                filterRequest,
            }),
    })

    return {
        data: data
            ? {
                content: data.getBrands.content,
                totalElements: data.getBrands.totalElements,
                totalPages: data.getBrands.totalPages,
            }
            : undefined,
        isLoading,
        error,
    }
}
