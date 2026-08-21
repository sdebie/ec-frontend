import {createLineItemStore, type LineItemStore} from '@/shared/store/createLineItemStore'

export interface QuoteLineItem {
  variantId: string
  productName: string
  variantLabel: string
  quantity: number
  /** Resolved thumbnail URL; absent on entries persisted before thumbnails existed. */
  imageUrl?: string | null
}

export type QuoteState = LineItemStore<QuoteLineItem>

export const useQuoteStore = createLineItemStore<QuoteLineItem>('ec_quote_items')
