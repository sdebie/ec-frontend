import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { WholesaleApplicationDetail, WholesaleCustomerDetail, WholesaleOrderRef } from './types'

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
        firstName
        lastName
        createdAt
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
  firstName: string
  lastName: string
  createdAt: string
}

interface AdminCustomerRawResponse {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  status: string
  shopperType: string
  registeredAt: string
  wholesaleApplication: AdminCustomerRawApplication | null
  recentOrders: WholesaleOrderRef[]
}

interface AdminCustomerResponse {
  adminCustomer: AdminCustomerRawResponse | null
}

function mapToWholesaleCustomerDetail(raw: AdminCustomerRawResponse): WholesaleCustomerDetail {
  let wholesaleApplication: WholesaleApplicationDetail | null = null

  if (raw.wholesaleApplication) {
    const app = raw.wholesaleApplication
    wholesaleApplication = {
      id: app.id,
      companyName: app.companyName,
      vatNumber: app.vatNumber,
      regNumber: app.regNumber,
      status: app.status as WholesaleApplicationDetail['status'],
      submittedAt: app.createdAt,
    }
  }

  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phone: raw.phone,
    status: raw.status as WholesaleCustomerDetail['status'],
    registeredAt: raw.registeredAt,
    wholesaleApplication,
    recentOrders: raw.recentOrders,
  }
}

export function useWholesaleCustomerDetail(customerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'wholesale-customers', customerId],
    queryFn: () =>
      adminGraphqlClient.request<AdminCustomerResponse>(ADMIN_CUSTOMER, { id: customerId }),
    enabled: !!customerId,
  })

  const customer = data?.adminCustomer
    ? mapToWholesaleCustomerDetail(data.adminCustomer)
    : undefined

  return {
    data: customer,
    isLoading,
    error,
  }
}
