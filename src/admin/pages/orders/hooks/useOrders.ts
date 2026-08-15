import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

import type { AdminOrderSummary, OrdersPage } from '../types'

export interface UseOrdersParams {
  page: number
  pageSize: number
  status?: string
  fromDate?: string
  toDate?: string
}

interface AdminOrderListResponse {
  adminOrderList: {
    content: AdminOrderSummary[]
    totalElements: number
  }
}

const ADMIN_ORDER_LIST = gql`
  query AdminOrderList(
    $pageIndex: Int!
    $pageSize: Int!
    $status: String
    $fromDate: String
    $toDate: String
  ) {
    adminOrderList(
      pageIndex: $pageIndex
      pageSize: $pageSize
      status: $status
      fromDate: $fromDate
      toDate: $toDate
    ) {
      content {
        id
        reference
        customerName
        placedAt
        itemCount
        total
        status
      }
      totalElements
    }
  }
`

/** `'ALL'` is the UI's "no filter" sentinel — it must never reach the backend. */
function isFiltering(value: string | undefined): value is string {
  return !!value && value !== 'ALL'
}

export function buildVariables(params: UseOrdersParams) {
  const variables: Record<string, unknown> = {
    // The table is 1-based; the backend pages from 0.
    pageIndex: params.page - 1,
    pageSize: params.pageSize,
  }

  if (isFiltering(params.status)) {
    variables.status = params.status
  }
  if (params.fromDate) {
    variables.fromDate = params.fromDate
  }
  if (params.toDate) {
    variables.toDate = params.toDate
  }

  return variables
}

export function useOrders(params: UseOrdersParams) {
  return useQuery({
    queryKey: ['admin', 'orders', 'list', params],
    queryFn: async (): Promise<OrdersPage> => {
      const response = await adminGraphqlClient.request<AdminOrderListResponse>(
        ADMIN_ORDER_LIST,
        buildVariables(params),
      )

      return {
        data: response.adminOrderList.content,
        total: response.adminOrderList.totalElements,
      }
    },
  })
}
