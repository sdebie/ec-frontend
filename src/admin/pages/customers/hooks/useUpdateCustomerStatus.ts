import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { CustomerStatus } from '../types'

const UPDATE_CUSTOMER_STATUS = gql`
  mutation UpdateCustomerStatus($id: String!, $status: String!) {
    updateCustomerStatus(id: $id, status: $status) {
      id
      status
    }
  }
`

interface UpdateCustomerStatusParams {
  customerId: string
  status: CustomerStatus
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ customerId, status }: UpdateCustomerStatusParams) => {
      await adminGraphqlClient.request(UPDATE_CUSTOMER_STATUS, {
        id: customerId,
        status,
      })
    },
    onSuccess: () => {
      // Prefix-matching: this single call covers the customer list, the count,
      // the customer detail, AND the wholesale list/detail — all of which live
      // under ['admin','customers', …] by design. The second, narrower call this
      // replaced was always redundant.
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
      toast.success('Customer status updated')
    },
    onError: (error) => {
      const message =
        error instanceof ClientError
          ? error.response.errors?.[0]?.message ?? 'Failed to update customer status'
          : 'Failed to update customer status'
      toast.error(message, { duration: 0 })
    },
  })
}
