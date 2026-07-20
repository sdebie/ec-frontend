import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartLineItem {
  variantId: string
  productName: string
  variantLabel: string
  quantity: number
}

export interface CartState {
  items: CartLineItem[]
  itemCount: number
  addItem: (item: CartLineItem) => void
  updateQty: (variantId: string, quantity: number) => void
  remove: (variantId: string) => void
  clearCart: () => void
}

const computeItemCount = (items: CartLineItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity, 0)

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId)
          const items = existing
            ? state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...state.items, item]
          return { items, itemCount: computeItemCount(items) }
        }),
      updateQty: (variantId, quantity) =>
        set((state) => {
          const items =
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity } : i
                )
          return { items, itemCount: computeItemCount(items) }
        }),
      remove: (variantId) =>
        set((state) => {
          const items = state.items.filter((i) => i.variantId !== variantId)
          return { items, itemCount: computeItemCount(items) }
        }),
      clearCart: () => set({ items: [], itemCount: 0 }),
    }),
    {
      name: 'ec_cart_items',
    }
  )
)
