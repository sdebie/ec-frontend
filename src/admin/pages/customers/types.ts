import type {SortItem} from '@/admin/utils'

export type CustomerStatus = 'ACTIVE' | 'PENDING' | 'DISABLED'
export type CustomerType = 'GUEST' | 'RETAILER' | 'WHOLESALER'
export type WholesaleStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface AdminCustomerSummary {
    id: string
    firstName: string
    lastName: string
    email: string
    shopperType: CustomerType
    status: CustomerStatus
    registeredAt: string
    wholesaleApplicationStatus?: string | null
}

export interface AdminOrderRef {
    id: string
    reference: string
    placedAt: string
    total: number
    status: string
}

/**
 * The customer's wholesale application, in full — shared by the retail
 * Customer Detail page and the Wholesale Customer Detail page so both render
 * identical data for the same customer regardless of which list opened them.
 */
export interface WholesaleApplication {
    id: string
    companyName: string
    vatNumber: string | null
    regNumber: string | null
    status: WholesaleStatus
    submittedAt: string
    applicantEmail: string
    accountEmail: string | null
    tradingName: string | null
    companyPhone: string | null
    companyEmail: string | null
    financeContactName: string | null
    financeContactEmail: string | null
    financeContactPhone: string | null
    purchaseOrderRequired: boolean | null
}

export interface AdminCustomerDetail extends AdminCustomerSummary {
    phone: string | null
    recentOrders: AdminOrderRef[]
    wholesaleApplication: WholesaleApplication | null
}

/**
 * Shape the shared CustomerIdentityPanel/WholesaleAccountPanel/RecentOrdersCard
 * components render — lives here (not in wholesale/types.ts) because those
 * components are shared between the retail and wholesale detail pages, and a
 * shared component can't reach into a domain-specific types file.
 */
export interface WholesaleCustomerDetail {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    status: CustomerStatus
    registeredAt: string
    wholesaleApplication: WholesaleApplication | null
    recentOrders: AdminOrderRef[]
}

/** Payload for the shared useWholesaleApplicationAction mutation (also used by the wholesale-only ApplicantInformationPanel). */
export interface WholesaleApplicationActionPayload {
    applicationId: string
    action: 'approve' | 'reject'
    reason?: string
    customerId?: string
}

export interface CustomersPage {
    data: AdminCustomerSummary[]
    total: number
}

export interface UseCustomersParams {
    page: number
    pageSize: number
    status?: string
    search?: string
    shopperType?: string
    sort?: SortItem[]
}

export interface CustomerStatusUpdatePayload {
    status: CustomerStatus
}

export function getAvailableActions(status: CustomerStatus): Array<'activate' | 'suspend'> {
    switch (status) {
        case 'PENDING':
            return ['activate']
        case 'ACTIVE':
            return ['suspend']
        case 'DISABLED':
            return ['activate']
    }
}

export function getCustomerStatusColor(status: CustomerStatus): 'green' | 'yellow' | 'red' {
    switch (status) {
        case 'ACTIVE':
            return 'green'
        case 'PENDING':
            return 'yellow'
        case 'DISABLED':
            return 'red'
    }
}

export function getWholesaleStatusColor(status: WholesaleStatus): 'green' | 'yellow' | 'red' {
    switch (status) {
        case 'APPROVED':
            return 'green'
        case 'PENDING':
            return 'yellow'
        case 'REJECTED':
            return 'red'
    }
}
