import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { UseWholesaleCustomersParams, WholesaleCustomerListItem } from './types'

const ALL_CUSTOMERS = gql`
  query AllCustomers($pageRequest: PageRequestInput!, $filterRequest: FilterRequestInput) {
    allCustomers(pageRequest: $pageRequest, filterRequest: $filterRequest) {
      id
      firstName
      lastName
      email
      status
      shopperType
      registeredAt
      wholesaleApplicationStatus
    }
  }
`

const CUSTOMER_COUNT = gql`
  query CustomerCount($filterRequest: FilterRequestInput) {
    customerCount(filterRequest: $filterRequest)
  }
`

interface AllCustomersResponse {
  allCustomers: WholesaleCustomerListItem[]
}

interface CustomerCountResponse {
  customerCount: number
}

function buildFilterRequest(params: UseWholesaleCustomersParams) {
  const filters: Array<{ key: string; operator: string; value: string }> = [
    { key: 'shopperType', operator: 'EQUALS', value: 'WHOLESALER' },
  ]

  if (params.status && params.status !== 'ALL') {
    filters.push({ key: 'status', operator: 'EQUALS', value: params.status })
  }

  if (params.search?.trim()) {
    filters.push({ key: 'search', operator: 'LIKE', value: params.search.trim() })
  }

  return { filters }
}

export function useWholesaleCustomers(params: UseWholesaleCustomersParams) {
  const pageRequest = { pageIndex: params.page - 1, pageSize: params.pageSize }
  const filterRequest = buildFilterRequest(params)

  const listQuery = useQuery({
    queryKey: ['admin', 'wholesale-customers', params],
    queryFn: () =>
      adminGraphqlClient.request<AllCustomersResponse>(ALL_CUSTOMERS, {
        pageRequest,
        filterRequest,
      }),
  })

  const countQuery = useQuery({
    queryKey: ['admin', 'wholesale-customers', 'count', params],
    queryFn: () =>
      adminGraphqlClient.request<CustomerCountResponse>(CUSTOMER_COUNT, { filterRequest }),
  })

  const data: WholesaleCustomerListItem[] | undefined = listQuery.data?.allCustomers
  const total = countQuery.data?.customerCount ?? 0

  return {
    data,
    total,
    isLoading: listQuery.isLoading || countQuery.isLoading,
  }
}
