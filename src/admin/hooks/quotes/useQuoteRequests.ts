import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { QuoteRequestStatus } from '@/shared/types/enums'
import type { SortItem } from '@/admin/utils'

const ALL_QUOTE_REQUESTS = gql`
  query AllQuoteRequests($pageRequest: PageRequestInput!, $filterRequest: FilterRequestInput) {
    allQuoteRequests(pageRequest: $pageRequest, filterRequest: $filterRequest) {
      id
      name
      company
      itemCount
      createdAt
      status
    }
  }
`

const QUOTE_REQUEST_COUNT = gql`
  query QuoteRequestCount($filterRequest: FilterRequestInput) {
    quoteRequestCount(filterRequest: $filterRequest)
  }
`

export interface QuoteRequestListItem {
  id: string
  name: string
  company: string | null
  itemCount: number
  createdAt: string
  status: QuoteRequestStatus
}

interface AllQuoteRequestsResponse {
  allQuoteRequests: QuoteRequestListItem[]
}

interface QuoteRequestCountResponse {
  quoteRequestCount: number
}

export interface UseQuoteRequestsParams {
  page: number
  pageSize: number
  status?: QuoteRequestStatus | 'ALL'
  sort?: SortItem[]
}

function buildFilters(params: UseQuoteRequestsParams) {
  const filters: Array<{ key: string; operator: string; value: string }> = []

  if (params.status && params.status !== 'ALL') {
    filters.push({ key: 'status', operator: 'EQUALS', value: params.status })
  }

  return filters
}

export function useQuoteRequests(params: UseQuoteRequestsParams) {
  const pageRequest = { pageIndex: params.page - 1, pageSize: params.pageSize }
  const filters = buildFilters(params)
  const sort = params.sort?.length ? params.sort : undefined

  const listQuery = useQuery({
    queryKey: ['admin', 'quote-requests', params],
    queryFn: () =>
      adminGraphqlClient.request<AllQuoteRequestsResponse>(ALL_QUOTE_REQUESTS, {
        pageRequest,
        filterRequest: { filters, ...(sort ? { sort } : {}) },
      }),
  })

  // Sorting the list changes nothing about how many rows match — the count is keyed
  // on the status filter alone, so toggling a sort does not throw away a cached total.
  const countFilterRequest = { filters }
  const countQuery = useQuery({
    queryKey: ['admin', 'quote-requests', 'count', countFilterRequest],
    queryFn: () =>
      adminGraphqlClient.request<QuoteRequestCountResponse>(QUOTE_REQUEST_COUNT, {
        filterRequest: countFilterRequest,
      }),
  })

  return {
    data: listQuery.data?.allQuoteRequests,
    total: countQuery.data?.quoteRequestCount ?? 0,
    isLoading: listQuery.isLoading || countQuery.isLoading,
  }
}
