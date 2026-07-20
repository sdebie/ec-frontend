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

export interface WholesaleApplication {
    id: string
    status: WholesaleStatus
    companyName: string
    vatNumber?: string | null
    regNumber?: string | null
    email?: string | null
    firstName?: string | null
    lastName?: string | null
    createdAt?: string | null
}

export interface AdminCustomerDetail extends AdminCustomerSummary {
    phone: string | null
    recentOrders: AdminOrderRef[]
    wholesaleApplication: WholesaleApplication | null
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
