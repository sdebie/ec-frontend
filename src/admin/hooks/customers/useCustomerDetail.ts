import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { AdminCustomerDetail } from './types'

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

interface AdminCustomerResponse {
  adminCustomer: AdminCustomerDetail | null
}

export function useCustomerDetail(customerId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'customers', customerId],
    queryFn: () =>
      adminGraphqlClient.request<AdminCustomerResponse>(ADMIN_CUSTOMER, { id: customerId }),
    enabled: !!customerId,
  })

  return {
    data: data?.adminCustomer ?? undefined,
    isLoading,
    error,
  }
}
