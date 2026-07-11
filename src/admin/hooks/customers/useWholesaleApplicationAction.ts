import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { WholesaleActionPayload } from './types'

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
    mutationFn: async ({ applicationId, action }: WholesaleActionPayload) => {
      if (action === 'approve') {
        await adminGraphqlClient.request(APPROVE_APPLICATION, { id: applicationId })
      } else {
        await adminGraphqlClient.request(REJECT_APPLICATION, { id: applicationId })
      }
    },
    onSuccess: (_data, { customerId, action }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers', customerId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers', 'list'] })
      toast.success(
        action === 'approve'
          ? 'Wholesale application approved'
          : 'Wholesale application rejected',
      )
    },
    onError: (error) => {
      const message =
        error instanceof ClientError
          ? error.response.errors?.[0]?.message ?? 'Failed to process wholesale application'
          : 'Failed to process wholesale application'
      toast.error(message, { duration: 0 })
    },
  })
}
