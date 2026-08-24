import {useMutation, useQueryClient} from '@tanstack/react-query'
import {ClientError, gql} from 'graphql-request'
import {toast} from '@/shared/ui/components/toast'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {QuoteItemPrice} from './quoteItemPrice'

const SAVE_QUOTE_DRAFT = gql`
    mutation SaveQuoteDraft($id: String!, $items: [QuoteItemPriceInputInput!]!, $notes: String) {
        saveQuoteDraft(id: $id, items: $items, notes: $notes) {
            id
            status
        }
    }
`

export interface SaveQuoteDraftPayload {
    id: string
    items: QuoteItemPrice[]
    notes: string | null
}

export function useSaveQuoteDraft() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({id, items, notes}: SaveQuoteDraftPayload) => {
            return adminGraphqlClient.request(SAVE_QUOTE_DRAFT, {id, items, notes})
        },
        onSuccess: (_data, {id}) => {
            queryClient.invalidateQueries({queryKey: ['admin', 'quote-requests']})
            queryClient.invalidateQueries({queryKey: ['admin', 'quote-requests', id]})
            toast.success('Draft saved')
        },
        onError: (error) => {
            const serverMessage =
                error instanceof ClientError ? error.response.errors?.[0]?.message : undefined
            toast.error(serverMessage ?? 'Failed to save draft', {duration: 0})
        },
    })
}
