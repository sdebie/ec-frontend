import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { AdminCustomerSummary, CustomersPage, UseCustomersParams } from './types'

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
  allCustomers: AdminCustomerSummary[]
}

interface CustomerCountResponse {
  customerCount: number
}

/** `'ALL'` is the UI's "no filter" sentinel — it must never reach the backend. */
function isFiltering(value: string | undefined): value is string {
  return !!value && value !== 'ALL'
}

function buildFilterRequest(params: UseCustomersParams) {
  const filters: Array<{ key: string; operator: string; value: string }> = []

  if (isFiltering(params.shopperType)) {
    filters.push({ key: 'shopperType', operator: 'EQUALS', value: params.shopperType })
  }
  if (isFiltering(params.status)) {
    filters.push({ key: 'status', operator: 'EQUALS', value: params.status })
  }
  if (params.search?.trim()) {
    filters.push({ key: 'search', operator: 'LIKE', value: params.search.trim() })
  }

  return { filters }
}

export function useCustomers(params: UseCustomersParams) {
  const pageRequest = { pageIndex: params.page - 1, pageSize: params.pageSize }
  const filterRequest = buildFilterRequest(params)

  const listQuery = useQuery({
    queryKey: ['admin', 'customers', 'list', params],
    queryFn: () =>
      adminGraphqlClient.request<AllCustomersResponse>(ALL_CUSTOMERS, {
        pageRequest,
        filterRequest,
      }),
  })

  const countQuery = useQuery({
    queryKey: ['admin', 'customers', 'count', filterRequest],
    queryFn: () =>
      adminGraphqlClient.request<CustomerCountResponse>(CUSTOMER_COUNT, { filterRequest }),
  })

  const data: CustomersPage | undefined = listQuery.data
    ? {
        data: listQuery.data.allCustomers,
        total: countQuery.data?.customerCount ?? 0,
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
