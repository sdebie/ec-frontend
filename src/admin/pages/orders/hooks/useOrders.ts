import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {SortItem} from '@/admin/utils'

import type {AdminOrderSummary, OrdersPage} from '../types'

export interface UseOrdersParams {
    page: number
    pageSize: number
    paymentState?: string
    fulfilmentState?: string
    fromDate?: string
    toDate?: string
    /** Only the first entry is used — `adminOrderList` accepts one sort column, not a list. */
    sort?: SortItem[]
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
        $paymentState: String
        $fulfilmentState: String
        $fromDate: String
        $toDate: String
        $sortBy: String
        $sortDir: String
    ) {
        adminOrderList(
            pageIndex: $pageIndex
            pageSize: $pageSize
            paymentState: $paymentState
            fulfilmentState: $fulfilmentState
            fromDate: $fromDate
            toDate: $toDate
            sortBy: $sortBy
            sortDir: $sortDir
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

    if (isFiltering(params.paymentState)) {
        variables.paymentState = params.paymentState
    }
    if (isFiltering(params.fulfilmentState)) {
        variables.fulfilmentState = params.fulfilmentState
    }
    if (params.fromDate) {
        variables.fromDate = params.fromDate
    }
    if (params.toDate) {
        variables.toDate = params.toDate
    }
    if (params.sort?.[0]) {
        variables.sortBy = params.sort[0].field
        variables.sortDir = params.sort[0].direction
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
