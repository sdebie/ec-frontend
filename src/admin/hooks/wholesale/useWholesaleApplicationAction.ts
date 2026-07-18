import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { WholesaleApplicationActionPayload } from './types'

const APPROVE_APPLICATION = gql`
  mutation ApproveWholesaleApplication($id: String!) {
    approveWholesaleApplication(id: $id) {
      id
      status
    }
  }
`

const REJECT_APPLICATION = gql`
  mutation RejectWholesaleApplication($id: String!) {
    rejectWholesaleApplication(id: $id) {
      id
      status
    }
  }
`

export function useWholesaleApplicationAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ applicationId, action }: WholesaleApplicationActionPayload) => {
      if (action === 'approve') {
        await adminGraphqlClient.request(APPROVE_APPLICATION, { id: applicationId })
      } else {
        await adminGraphqlClient.request(REJECT_APPLICATION, { id: applicationId })
      }
    },
    onSuccess: (_data, { action, customerId }) => {
      // Always invalidate the wholesale caches; approving/rejecting an application
      // affects both the application queue and the wholesale customer lists.
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesale-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesale-customers'] })
      // When invoked from a customer-scoped screen, also refresh the customer caches.
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'customers', customerId] })
        queryClient.invalidateQueries({ queryKey: ['admin', 'customers', 'list'] })
      }
      toast.success(
        action === 'approve'
          ? 'Wholesale application approved and customer account created'
          : 'Wholesale application rejected',
      )
    },
    onError: (error) => {
      const serverMessage =
        error instanceof ClientError ? error.response.errors?.[0]?.message : undefined
      console.error('[WholesaleApplicationAction] action failed:', serverMessage ?? error)
      toast.error(serverMessage ?? 'Failed to process wholesale application', { duration: 0 })
    },
  })
}
