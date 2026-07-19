import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

const WHOLESALE_APPLICATION_DETAIL = gql`
  query WholesaleApplicationDetail($id: String!) {
    wholesaleApplication(id: $id) {
      id
      status
      firstName
      lastName
      email
      phone
      applicantEmail
      companyName
      companyEmail
      companyPhone
      tradingName
      vatNumber
      regNumber
      notes
      customerId
      financeContactName
      financeContactEmail
      financeContactPhone
      purchaseOrderRequired
      physicalAddressLine1
      physicalAddressLine2
      physicalSuburb
      physicalCity
      physicalProvince
      physicalPostalCode
      postalAddressLine1
      postalAddressLine2
      postalSuburb
      postalCity
      postalProvince
      postalPostalCode
      createdAt
      processedAt
      rejectionReason
    }
  }
`

export interface WholesaleApplicationDetail {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED'
  firstName: string
  lastName: string
  email: string
  phone: string | null
  applicantEmail: string
  companyName: string
  companyEmail: string | null
  companyPhone: string | null
  tradingName: string | null
  vatNumber: string | null
  regNumber: string | null
  notes: string | null
  customerId: string | null
  financeContactName: string | null
  financeContactEmail: string | null
  financeContactPhone: string | null
  purchaseOrderRequired: boolean | null
  physicalAddressLine1: string | null
  physicalAddressLine2: string | null
  physicalSuburb: string | null
  physicalCity: string | null
  physicalProvince: string | null
  physicalPostalCode: string | null
  postalAddressLine1: string | null
  postalAddressLine2: string | null
  postalSuburb: string | null
  postalCity: string | null
  postalProvince: string | null
  postalPostalCode: string | null
  createdAt: string
  processedAt: string | null
  rejectionReason: string | null
}

interface WholesaleApplicationDetailResponse {
  wholesaleApplication: WholesaleApplicationDetail | null
}

export function useWholesaleApplicationDetail(applicationId: string) {
  return useQuery({
    queryKey: ['admin', 'wholesale-application', applicationId],
    queryFn: () =>
      adminGraphqlClient.request<WholesaleApplicationDetailResponse>(
        WHOLESALE_APPLICATION_DETAIL,
        { id: applicationId },
      ),
    enabled: !!applicationId,
    select: (data) => data.wholesaleApplication,
  })
}
