import {useMutation} from '@tanstack/react-query'
import {ClientError, gql} from 'graphql-request'
import {toast} from '@/shared/ui/components/toast'

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import type {QuoteItemPrice} from './quoteItemPrice'

const PREVIEW_QUOTE_EMAIL = gql`
    query PreviewQuoteEmail($id: String!, $items: [QuoteItemPriceInputInput!]!, $notes: String) {
        previewQuoteEmail(id: $id, items: $items, notes: $notes)
    }
`

export interface PreviewQuoteEmailPayload {
    id: string
    items: QuoteItemPrice[]
    notes: string | null
}

interface PreviewQuoteEmailResponse {
    previewQuoteEmail: string
}

/**
 * Modelled as a mutation, not a query, even though previewQuoteEmail has no side effects —
 * staff trigger it on demand (clicking Preview with whatever they've currently typed), which
 * is the imperative "run this now" shape useMutation fits, not a cache-backed useQuery.
 */
export function usePreviewQuoteEmail() {
    return useMutation({
        mutationFn: async ({id, items, notes}: PreviewQuoteEmailPayload) => {
            const response = await adminGraphqlClient.request<PreviewQuoteEmailResponse>(
                PREVIEW_QUOTE_EMAIL,
                {id, items, notes},
            )
            return response.previewQuoteEmail
        },
        onError: (error) => {
            const serverMessage =
                error instanceof ClientError ? error.response.errors?.[0]?.message : undefined
            toast.error(serverMessage ?? 'Failed to render quote preview', {duration: 0})
        },
    })
}
