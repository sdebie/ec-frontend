import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { AdminCustomerDetail, WholesaleApplication } from '../../types'

const ADMIN_CUSTOMER = gql`
  query AdminCustomer($id: String!) {
    adminCustomer(id: $id) {
      id
      firstName
      lastName
      email
      phone
      status
      shopperType
      registeredAt
      wholesaleApplication {
        id
        status
        companyName
        vatNumber
        regNumber
        email
        createdAt
        applicantEmail
        tradingName
        companyPhone
        companyEmail
        financeContactName
        financeContactEmail
        financeContactPhone
        purchaseOrderRequired
      }
      recentOrders {
        id
        reference
        placedAt
        total
        status
      }
    }
  }
`

interface AdminCustomerRawApplication {
  id: string
  status: string
  companyName: string
  vatNumber: string | null
  regNumber: string | null
  email: string
  createdAt: string
  applicantEmail: string
  tradingName: string | null
  companyPhone: string | null
  companyEmail: string | null
  financeContactName: string | null
  financeContactEmail: string | null
  financeContactPhone: string | null
  purchaseOrderRequired: boolean | null
}

interface AdminCustomerRawResponse extends Omit<AdminCustomerDetail, 'wholesaleApplication'> {
  wholesaleApplication: AdminCustomerRawApplication | null
}

interface AdminCustomerResponse {
  adminCustomer: AdminCustomerRawResponse | null
}

function mapWholesaleApplication(app: AdminCustomerRawApplication): WholesaleApplication {
  return {
    id: app.id,
    companyName: app.companyName,
    vatNumber: app.vatNumber,
    regNumber: app.regNumber,
    status: app.status as WholesaleApplication['status'],
    submittedAt: app.createdAt,
    applicantEmail: app.applicantEmail,
    accountEmail: app.email || null,
    tradingName: app.tradingName,
    companyPhone: app.companyPhone,
    companyEmail: app.companyEmail,
    financeContactName: app.financeContactName,
    financeContactEmail: app.financeContactEmail,
    financeContactPhone: app.financeContactPhone,
    purchaseOrderRequired: app.purchaseOrderRequired,
  }
}

function mapToAdminCustomerDetail(raw: AdminCustomerRawResponse): AdminCustomerDetail {
  return {
    ...raw,
    wholesaleApplication: raw.wholesaleApplication
      ? mapWholesaleApplication(raw.wholesaleApplication)
      : null,
  }
}

export function useCustomerDetail(customerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'customers', customerId],
    queryFn: () =>
      adminGraphqlClient.request<AdminCustomerResponse>(ADMIN_CUSTOMER, { id: customerId }),
    enabled: !!customerId,
  })

  const customer = data?.adminCustomer ? mapToAdminCustomerDetail(data.adminCustomer) : undefined

  return {
    data: customer,
    isLoading,
    error,
  }
}
