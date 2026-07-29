import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { QuoteRequestStatus } from '@/shared/types/enums'

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
}

function buildFilterRequest(params: UseQuoteRequestsParams) {
  const filters: Array<{ key: string; operator: string; value: string }> = []

  if (params.status && params.status !== 'ALL') {
    filters.push({ key: 'status', operator: 'EQUALS', value: params.status })
  }

  return { filters }
}

export function useQuoteRequests(params: UseQuoteRequestsParams) {
  const pageRequest = { pageIndex: params.page - 1, pageSize: params.pageSize }
  const filterRequest = buildFilterRequest(params)

  const listQuery = useQuery({
    queryKey: ['admin', 'quote-requests', params],
    queryFn: () =>
      adminGraphqlClient.request<AllQuoteRequestsResponse>(ALL_QUOTE_REQUESTS, {
        pageRequest,
        filterRequest,
      }),
  })

  const countQuery = useQuery({
    queryKey: ['admin', 'quote-requests', 'count', filterRequest],
    queryFn: () =>
      adminGraphqlClient.request<QuoteRequestCountResponse>(QUOTE_REQUEST_COUNT, {
        filterRequest,
      }),
  })

  return {
    data: listQuery.data?.allQuoteRequests,
    total: countQuery.data?.quoteRequestCount ?? 0,
    isLoading: listQuery.isLoading || countQuery.isLoading,
  }
}
