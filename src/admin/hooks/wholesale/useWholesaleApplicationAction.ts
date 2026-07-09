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

const CREATE_WHOLESALE_CUSTOMER = gql`
  mutation CreateWholesaleCustomer($applicationId: String!) {
    createWholesaleCustomer(applicationId: $applicationId) {
      id
      email
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
        await adminGraphqlClient.request(CREATE_WHOLESALE_CUSTOMER, { applicationId })
      } else {
        await adminGraphqlClient.request(REJECT_APPLICATION, { id: applicationId })
      }
    },
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesale-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'wholesale-customers'] })
      toast.success(
        action === 'approve'
          ? 'Wholesale application approved and customer account created'
          : 'Wholesale application rejected',
      )
    },
    onError: (error) => {
      console.error(error instanceof ClientError ? error.response.errors?.[0]?.message : error)
      toast.error('Failed to process wholesale application', { duration: 0 })
    },
  })
}
