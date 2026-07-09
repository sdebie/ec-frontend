import { useMutation } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { graphqlClient } from '@/shared/api/graphql/graphqlClient'

const CREATE_WHOLESALE_APPLICATION = gql`
  mutation CreateWholesaleApplication($customer: WholesaleCustomerDtoInput!) {
    createWholesaleApplication(customer: $customer) {
      id
      email
      status
    }
  }
`

export interface WholesaleCustomerDtoInput {
  email: string
  firstName: string
  lastName: string
  phone: string
  companyName: string
  vatNumber: string
  regNumber: string
  notes: string
  status: string
  physicalAddressLine1: string
  physicalAddressLine2: string
  physicalSuburb: string
  physicalCity: string
  physicalProvince: string
  physicalPostalCode: string
  postalAddressLine1: string
  postalAddressLine2: string
  postalSuburb: string
  postalCity: string
  postalProvince: string
  postalPostalCode: string
}

export function useWholesaleApplicationSubmit() {
  return useMutation({
    mutationFn: (input: WholesaleCustomerDtoInput) =>
      graphqlClient.request(CREATE_WHOLESALE_APPLICATION, { customer: input }),
    onError: (error) => {
      console.error('[WholesaleApplication] submit failed:', error)
      const message =
        error instanceof ClientError
          ? error.response.errors?.[0]?.message ?? 'Failed to submit application'
          : 'Failed to submit application'
      toast.error(message, { duration: 0 })
    },
  })
}
