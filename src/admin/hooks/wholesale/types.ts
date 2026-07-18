import type { AdminOrderRef, CustomerStatus, WholesaleStatus } from '@/admin/hooks/customers/types'

export type { AdminOrderRef as WholesaleOrderRef }

// --- Application Queue ---

export interface WholesaleApplicationListItem {
  id: string
  firstName: string
  lastName: string
  email: string
  status: WholesaleStatus
  createdAt: string
}

export interface WholesaleApplicationsPage {
  data: WholesaleApplicationListItem[]
  total: number
}

export interface UseWholesaleApplicationsParams {
  page: number
  pageSize: number
  status?: WholesaleStatus | 'ALL'
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

export interface WholesaleCustomersPage {
  data: WholesaleCustomerListItem[]
  total: number
}

export interface UseWholesaleCustomersParams {
  page: number
  pageSize: number
  status?: CustomerStatus | 'ALL'
  search?: string
}

// --- Customer Detail ---

export interface WholesaleApplicationSummary {
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

export interface WholesaleCustomerDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  status: CustomerStatus
  registeredAt: string
  wholesaleApplication: WholesaleApplicationSummary | null
  recentOrders: AdminOrderRef[]
}

// --- Actions ---

export interface WholesaleApplicationActionPayload {
  applicationId: string
  action: 'approve' | 'reject'
  // Optional: when the action is taken from a customer-scoped screen (e.g. the
  // customer detail page), pass the customer id so the customer caches are
  // invalidated in addition to the wholesale caches.
  customerId?: string
}

export interface WholesaleCustomerStatusPayload {
  customerId: string
  status: 'ACTIVE' | 'DISABLED'
}
