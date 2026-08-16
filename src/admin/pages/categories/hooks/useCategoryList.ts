import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import {buildSearchFilterRequest, type FilterRequestInput} from '@/admin/utils'
import {useTableSort} from '@/admin/hooks/useTableSort'
import type {CategoryListItem} from '../types'

interface GetCategoriesResponse {
    getCategories: {
        content: CategoryListItem[]
        totalElements: number
        totalPages: number
        pageIndex: number
        pageSize: number
    }
}

const GET_CATEGORIES = gql`
    query GetCategories($pageIndex: Int, $pageSize: Int, $filterRequest: FilterRequestInput) {
        getCategories(pageIndex: $pageIndex, pageSize: $pageSize, filterRequest: $filterRequest) {
            content {
                id
                name
                slug
                description
                imageUrl
                parent {
                    id
                    name
                }
            }
            totalElements
            totalPages
            pageIndex
            pageSize
        }
    }
`

export interface UseCategoryListParams {
    pageIndex: number
    pageSize: number
    search?: string
}

export function useCategoryList(params: UseCategoryListParams) {
    const {pageIndex, pageSize, search = ''} = params

    const {sorting, onSortingChange, sort} = useTableSort()

    const filterRequest: FilterRequestInput | undefined = buildSearchFilterRequest(search, sort)

    const {data, isLoading, error} = useQuery({
        queryKey: ['admin-category-list', pageIndex, pageSize, search, sort],
        queryFn: () =>
            adminGraphqlClient.request<GetCategoriesResponse>(GET_CATEGORIES, {
                pageIndex,
                pageSize,
                filterRequest,
            }),
    })

    return {
        data: data
            ? {
                content: data.getCategories.content,
                totalElements: data.getCategories.totalElements,
                totalPages: data.getCategories.totalPages,
            }
            : undefined,
        isLoading,
        error,
        sorting,
        onSortingChange,
    }
}
