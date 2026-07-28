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
  mutation RejectWholesaleApplication($id: String!, $reason: String!) {
    rejectWholesaleApplication(id: $id, reason: $reason) {
      id
      status
    }
  }
`

export function useWholesaleApplicationAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ applicationId, action, reason }: WholesaleApplicationActionPayload) => {
      if (action === 'approve') {
        await adminGraphqlClient.request(APPROVE_APPLICATION, { id: applicationId })
      } else {
        await adminGraphqlClient.request(REJECT_APPLICATION, { id: applicationId, reason: reason! })
      }
    },
    onSuccess: (_data, { action, applicationId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesale-applications'] })
      // Invalidate the detail query for this specific application.
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesale-application', applicationId] })
      // One prefix now covers every customer cache — both list screens, both
      // detail screens. This used to need a hand-maintained list of keys
      // (including the retired ['admin','wholesale-customers'] family), which is
      // exactly how the two screens drifted out of sync. Unconditional, because
      // approving an application changes the customer's tier wherever it is shown.
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
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
