import { useQuery } from '@tanstack/react-query'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { STAFF_LIST, STAFF_COUNT } from './queries'
import type { StaffMember } from './types'

export interface UseStaffParams {
  pageIndex: number
  pageSize: number
  search: string
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

function buildFilterRequest(search: string) {
  if (!search.trim()) {
    return {}
  }

  return {
    filterGroups: [
      {
        operator: 'OR',
        filters: [
          { key: 'fullName', operator: 'ILIKE', value: search.trim() },
          { key: 'email', operator: 'ILIKE', value: search.trim() },
        ],
      },
    ],
  }
}

export function useStaff(params: UseStaffParams) {
  const pageRequest = { pageIndex: params.pageIndex, pageSize: params.pageSize }
  const filterRequest = buildFilterRequest(params.search)

  const listQuery = useQuery({
    queryKey: ['admin', 'staff', 'list', { pageIndex: params.pageIndex, pageSize: params.pageSize, search: params.search }],
    queryFn: () =>
      adminGraphqlClient.request<StaffListResponse>(STAFF_LIST, {
        pageRequest,
        filterRequest,
      }),
  })

  const countQuery = useQuery({
    queryKey: ['admin', 'staff', 'count', filterRequest],
    queryFn: () =>
      adminGraphqlClient.request<StaffCountResponse>(STAFF_COUNT, { filterRequest }),
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
