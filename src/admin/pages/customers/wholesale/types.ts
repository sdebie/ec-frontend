import type {AdminOrderRef, CustomerStatus, WholesaleStatus} from '../types'
import type {SortItem} from '@/admin/utils'

export type {AdminOrderRef as WholesaleOrderRef}

// --- Application Queue ---
export interface WholesaleApplicationListItem {
    id: string
    firstName: string
    lastName: string
    email: string
    status: WholesaleStatus
    createdAt: string
}

export interface UseWholesaleApplicationsParams {
    page: number
    pageSize: number
    status?: WholesaleStatus | 'ALL'
    fromDate?: string
    toDate?: string
    sort?: SortItem[]
}

// --- Customer List ---
export interface WholesaleCustomerListItem {
    id: string
    firstName: string
    lastName: string
    email: string
    status: CustomerStatus
    wholesaleApplicationStatus: WholesaleStatus | null
    registeredAt: string
}

export interface UseWholesaleCustomersParams {
    page: number
    pageSize: number
    status?: CustomerStatus | 'ALL'
    search?: string
    sort?: SortItem[]
}
