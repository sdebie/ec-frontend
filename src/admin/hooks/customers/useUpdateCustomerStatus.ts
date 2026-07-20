import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { CustomerStatus } from './types'

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
    onSuccess: (_data, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers', customerId] })
      toast.success('Customer status updated')
    },
    onError: (error) => {
      console.error('[Customers] update customer status failed:', error)
      const message =
        error instanceof ClientError
          ? error.response.errors?.[0]?.message ?? 'Failed to update customer status'
          : 'Failed to update customer status'
      toast.error(message, { duration: 0 })
    },
  })
}
