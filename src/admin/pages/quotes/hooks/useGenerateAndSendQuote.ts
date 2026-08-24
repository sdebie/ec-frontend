import {useMutation, useQueryClient} from '@tanstack/react-query'
import {ClientError, gql} from 'graphql-request'
import {toast} from '@/shared/ui/components/toast'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {QuoteItemPrice} from './quoteItemPrice'

const GENERATE_AND_SEND_QUOTE = gql`
    mutation GenerateAndSendQuote($id: String!, $items: [QuoteItemPriceInputInput!]!, $notes: String) {
        generateAndSendQuote(id: $id, items: $items, notes: $notes) {
            id
            status
        }
    }
`

export interface GenerateAndSendQuotePayload {
    id: string
    items: QuoteItemPrice[]
    notes: string | null
}

export function useGenerateAndSendQuote() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({id, items, notes}: GenerateAndSendQuotePayload) => {
            return adminGraphqlClient.request(GENERATE_AND_SEND_QUOTE, {id, items, notes})
        },
        onSuccess: (_data, {id}) => {
            queryClient.invalidateQueries({queryKey: ['admin', 'quote-requests']})
            queryClient.invalidateQueries({queryKey: ['admin', 'quote-requests', id]})
            toast.success('Quote sent')
        },
        onError: (error) => {
            const serverMessage =
                error instanceof ClientError ? error.response.errors?.[0]?.message : undefined
            toast.error(serverMessage ?? 'Failed to send quote', {duration: 0})
        },
    })
}
