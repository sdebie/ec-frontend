import {useQuery} from '@tanstack/react-query'
import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {SortItem} from '@/admin/utils'
import {STAFF_COUNT, STAFF_LIST} from './queries'
import type {StaffMember} from './types'

export interface UseStaffParams {
    pageIndex: number
    pageSize: number
    search: string
    sort?: SortItem[]
}

interface StaffListResponse {
    staffList: StaffMember[]
}

interface StaffCountResponse {
    staffCount: number
}

export interface StaffPage {
    data: StaffMember[]
    total: number
}

function buildFilterGroups(search: string) {
    if (!search.trim()) {
        return undefined
    }

    return [
        {
            operator: 'OR',
            filters: [
                {key: 'fullName', operator: 'ILIKE', value: search.trim()},
                {key: 'email', operator: 'ILIKE', value: search.trim()},
            ],
        },
    ]
}

export function useStaff(params: UseStaffParams) {
    const pageRequest = {pageIndex: params.pageIndex, pageSize: params.pageSize}
    const filterGroups = buildFilterGroups(params.search)
    const sort = params.sort?.length ? params.sort : undefined

    const listQuery = useQuery({
        queryKey: [
            'admin',
            'staff',
            'list',
            {pageIndex: params.pageIndex, pageSize: params.pageSize, search: params.search, sort},
        ],
        queryFn: () =>
            adminGraphqlClient.request<StaffListResponse>(STAFF_LIST, {
                pageRequest,
                filterRequest: {...(filterGroups ? {filterGroups} : {}), ...(sort ? {sort} : {})},
            }),
    })

    // Sorting the list changes nothing about how many rows match — the count is keyed
    // on search alone, so toggling a sort does not throw away a cached total.
    const countFilterRequest = filterGroups ? {filterGroups} : {}
    const countQuery = useQuery({
        queryKey: ['admin', 'staff', 'count', countFilterRequest],
        queryFn: () =>
            adminGraphqlClient.request<StaffCountResponse>(STAFF_COUNT, {filterRequest: countFilterRequest}),
    })

    const data: StaffPage | undefined = listQuery.data
        ? {
            data: listQuery.data.staffList,
            total: countQuery.data?.staffCount ?? 0,
        }
        : undefined

    return {
        data,
        isLoading: listQuery.isLoading || countQuery.isLoading,
        isError: listQuery.isError || countQuery.isError,
        error: listQuery.error ?? countQuery.error,
        refetch: listQuery.refetch,
    }
}
