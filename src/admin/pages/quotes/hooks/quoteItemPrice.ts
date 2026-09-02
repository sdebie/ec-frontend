/** One requested item's staff-entered unit price — the shared shape both previewQuoteEmail
 *  and generateAndSendQuote send as their `items` argument. */
export interface QuoteItemPrice {
    itemId: string
    unitPrice: number
}
