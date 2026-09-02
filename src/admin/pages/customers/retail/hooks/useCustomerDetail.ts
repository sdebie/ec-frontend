import { useQuery } from '@tanstack/react-query'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import {
  ADMIN_CUSTOMER_DETAIL_QUERY,
  type AdminCustomerDetailRawApplication,
} from '@/admin/pages/customers/hooks/adminCustomerDetailQuery'
import type { AdminCustomerDetail, WholesaleApplication } from '../../types'

interface AdminCustomerRawResponse extends Omit<AdminCustomerDetail, 'wholesaleApplication'> {
  wholesaleApplication: AdminCustomerDetailRawApplication | null
}

interface AdminCustomerResponse {
  adminCustomer: AdminCustomerRawResponse | null
}

function mapWholesaleApplication(app: AdminCustomerDetailRawApplication): WholesaleApplication {
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
      adminGraphqlClient.request<AdminCustomerResponse>(ADMIN_CUSTOMER_DETAIL_QUERY, { id: customerId }),
    enabled: !!customerId,
  })

  const customer = data?.adminCustomer ? mapToAdminCustomerDetail(data.adminCustomer) : undefined

  return {
    data: customer,
    isLoading,
    error,
  }
}
