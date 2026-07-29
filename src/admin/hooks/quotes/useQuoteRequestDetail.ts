import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { QuoteRequestStatus } from '@/shared/types/enums'

const QUOTE_REQUEST_DETAIL = gql`
  query QuoteRequestDetail($id: String!) {
    quoteRequest(id: $id) {
      id
      name
      email
      phone
      company
      message
      status
      createdAt
      statusChangedAt
      items {
        variantId
        productNameSnapshot
        variantSkuSnapshot
        quantity
      }
    }
  }
`

export interface QuoteRequestItem {
  variantId: string | null
  productNameSnapshot: string
  variantSkuSnapshot: string | null
  quantity: number
}

export interface QuoteRequestDetail {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string | null
  status: QuoteRequestStatus
  createdAt: string
  statusChangedAt: string | null
  items: QuoteRequestItem[]
}

interface QuoteRequestDetailResponse {
  quoteRequest: QuoteRequestDetail | null
}

export function useQuoteRequestDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'quote-requests', id],
    queryFn: () =>
      adminGraphqlClient.request<QuoteRequestDetailResponse>(QUOTE_REQUEST_DETAIL, { id }),
    enabled: !!id,
    select: (data) => data.quoteRequest,
  })
}
