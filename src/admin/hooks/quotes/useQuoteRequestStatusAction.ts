import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { QuoteRequestStatus } from '@/shared/types/enums'

const UPDATE_QUOTE_REQUEST_STATUS = gql`
  mutation UpdateQuoteRequestStatus($id: String!, $status: String!) {
    updateQuoteRequestStatus(id: $id, status: $status) {
      id
      status
    }
  }
`

interface UpdateQuoteRequestStatusResponse {
  updateQuoteRequestStatus: {
    id: string
    status: QuoteRequestStatus
  }
}

export interface QuoteRequestStatusPayload {
  id: string
  status: QuoteRequestStatus
}

export function useQuoteRequestStatusAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: QuoteRequestStatusPayload) => {
      return adminGraphqlClient.request<UpdateQuoteRequestStatusResponse>(
        UPDATE_QUOTE_REQUEST_STATUS,
        { id, status },
      )
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests', id] })
      toast.success('Quote request status updated')
    },
    onError: (error) => {
      const serverMessage =
        error instanceof ClientError ? error.response.errors?.[0]?.message : undefined
      console.error('[QuoteRequests] status update failed:', serverMessage ?? error)
      toast.error(serverMessage ?? 'Failed to update quote request status', { duration: 0 })
    },
  })
}
