import {useCallback, useEffect, useMemo, useRef} from 'react'
import {useSearchParams} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import type {OnChangeFn, SortingState, Updater} from '@tanstack/react-table'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import {buildSearchFilterRequest, type FilterRequestInput, type SortItem} from '@/admin/utils'
import type {BrandListItem} from '../types'

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
}

export function useBrandList(params: UseBrandListParams) {
    const {pageIndex, pageSize, search = ''} = params

    // Sort state lives in the URL (sortBy/sortDir), same as page/search — a
    // sorted column survives navigate(-1) from the create/edit form the same
    // way the page number does.
    const [searchParams, setSearchParams] = useSearchParams()
    const sortField = searchParams.get('sortBy')
    const sortDesc = searchParams.get('sortDir') === 'desc'
    const sorting = useMemo<SortingState>(
        () => (sortField ? [{id: sortField, desc: sortDesc}] : []),
        [sortField, sortDesc],
    )

    // react-table's sorting plugin reconciles its own default ({[]}) back out
    // via onSortingChange during mount — including every remount navigate(-1)
    // causes when returning from edit/create — which would silently clear a
    // sort restored from the URL right after it was read. That reconciliation
    // is synchronous within React's own render/commit/effect cycle, so a plain
    // useEffect flipping a mounted flag still runs too early to help; this
    // defers one macrotask via setTimeout(0), past the point where any
    // synchronous mount-time noise could still be pending. Same technique as
    // BrandListPage's own pagination guard, kept as an independent ref since
    // the two are unrelated pieces of state reconciling on the same timeline.
    const hasMountedRef = useRef(false)
    useEffect(() => {
        const id = setTimeout(() => {
            hasMountedRef.current = true
        }, 0)
        return () => clearTimeout(id)
    }, [])

    const onSortingChange: OnChangeFn<SortingState> = useCallback((updater: Updater<SortingState>) => {
        if (!hasMountedRef.current) return
        const next = typeof updater === 'function' ? updater(sorting) : updater
        setSearchParams((prev) => {
            const nextParams = new URLSearchParams(prev)
            const nextSort = next[0]
            if (nextSort) {
                nextParams.set('sortBy', nextSort.id)
                nextParams.set('sortDir', nextSort.desc ? 'desc' : 'asc')
            } else {
                nextParams.delete('sortBy')
                nextParams.delete('sortDir')
            }
            nextParams.set('page', '0')
            return nextParams
        })
    }, [sorting, setSearchParams])

    const sort: SortItem[] | undefined = sortField
        ? [{field: sortField, direction: sortDesc ? 'DESC' : 'ASC'}]
        : undefined

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
        sorting,
        onSortingChange,
    }
}
