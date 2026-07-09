import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { WholesaleCustomerStatusPayload } from './types'

const UPDATE_CUSTOMER_STATUS = gql`
  mutation UpdateCustomerStatus($id: String!, $status: String!) {
    updateCustomerStatus(id: $id, status: $status) {
      id
      status
    }
  }
`

export function useWholesaleCustomerStatusAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ customerId, status }: WholesaleCustomerStatusPayload) => {
      await adminGraphqlClient.request(UPDATE_CUSTOMER_STATUS, {
        id: customerId,
        status,
      })
    },
    onSuccess: (_data, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesale-customers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesale-customers', customerId] })
      toast.success('Customer status updated')
    },
    onError: (error) => {
      console.error(error instanceof ClientError ? error.response.errors?.[0]?.message : error)
      toast.error('Failed to update wholesale customer status', { duration: 0 })
    },
  })
}
