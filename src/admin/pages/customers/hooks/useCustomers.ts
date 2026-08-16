import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { AdminCustomerSummary, CustomersPage, UseCustomersParams } from '../types'

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

function buildFilters(params: UseCustomersParams) {
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

  return filters
}

export function useCustomers(params: UseCustomersParams) {
  const pageRequest = { pageIndex: params.page - 1, pageSize: params.pageSize }
  const filters = buildFilters(params)
  const sort = params.sort?.length ? params.sort : undefined

  const listQuery = useQuery({
    queryKey: ['admin', 'customers', 'list', params],
    queryFn: () =>
      adminGraphqlClient.request<AllCustomersResponse>(ALL_CUSTOMERS, {
        pageRequest,
        filterRequest: { filters, ...(sort ? { sort } : {}) },
      }),
  })

  // Sorting the list changes nothing about how many rows match — the count is keyed
  // on the other filters alone, so toggling a sort does not throw away a cached total.
  const countFilterRequest = { filters }
  const countQuery = useQuery({
    queryKey: ['admin', 'customers', 'count', countFilterRequest],
    queryFn: () =>
      adminGraphqlClient.request<CustomerCountResponse>(CUSTOMER_COUNT, { filterRequest: countFilterRequest }),
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
