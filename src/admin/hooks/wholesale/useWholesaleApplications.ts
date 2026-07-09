import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { UseWholesaleApplicationsParams, WholesaleApplicationListItem } from './types'

const ALL_WHOLESALE_APPLICATIONS = gql`
  query AllWholesaleApplications($pageRequest: PageRequestInput!, $filterRequest: FilterRequestInput) {
    allWholesaleApplications(pageRequest: $pageRequest, filterRequest: $filterRequest) {
      id
      firstName
      lastName
      email
      status
      createdAt
    }
  }
`

const WHOLESALE_APPLICATION_COUNT = gql`
  query WholesaleApplicationCount($filterRequest: FilterRequestInput) {
    wholesaleApplicationCount(filterRequest: $filterRequest)
  }
`

interface AllWholesaleApplicationsResponse {
  allWholesaleApplications: WholesaleApplicationListItem[]
}

interface WholesaleApplicationCountResponse {
  wholesaleApplicationCount: number
}

function buildFilterRequest(params: UseWholesaleApplicationsParams) {
  const filters: Array<{ key: string; operator: string; value: string }> = []

  if (params.status && params.status !== 'ALL') {
    filters.push({ key: 'status', operator: 'EQUALS', value: params.status })
  }

  return { filters }
}

export function useWholesaleApplications(params: UseWholesaleApplicationsParams) {
  const pageRequest = { pageIndex: params.page - 1, pageSize: params.pageSize }
  const filterRequest = buildFilterRequest(params)

  const listQuery = useQuery({
    queryKey: ['admin', 'wholesale-applications', params],
    queryFn: () =>
      adminGraphqlClient.request<AllWholesaleApplicationsResponse>(ALL_WHOLESALE_APPLICATIONS, {
        pageRequest,
        filterRequest,
      }),
  })

  const countQuery = useQuery({
    queryKey: ['admin', 'wholesale-applications', 'count', filterRequest],
    queryFn: () =>
      adminGraphqlClient.request<WholesaleApplicationCountResponse>(WHOLESALE_APPLICATION_COUNT, {
        filterRequest,
      }),
  })

  return {
    data: listQuery.data?.allWholesaleApplications,
    total: countQuery.data?.wholesaleApplicationCount ?? 0,
    isLoading: listQuery.isLoading || countQuery.isLoading,
  }
}
