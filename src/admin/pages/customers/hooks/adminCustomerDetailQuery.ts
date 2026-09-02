import { gql } from 'graphql-request'

/**
 * Single `AdminCustomer` query shared by the retail and wholesale customer
 * detail pages (`useCustomerDetail` / `useWholesaleCustomerDetail`) — each
 * hook maps the raw response onto its own domain type via
 * {@link AdminCustomerDetailRawApplication}.
 */
export const ADMIN_CUSTOMER_DETAIL_QUERY = gql`
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

export interface AdminCustomerDetailRawApplication {
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
