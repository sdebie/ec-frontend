import {createLineItemStore, type LineItemStore} from '@/shared/store/createLineItemStore'

export interface CartLineItem {
    variantId: string
    productName: string
    variantLabel: string
    quantity: number
}

export type CartState = LineItemStore<CartLineItem>

export const useCartStore = createLineItemStore<CartLineItem>('ec_cart_items')
