

export type OrderItemsData = {
    unitPrice: number
    quantity: number
}
export type OrderData = {
    id: string
    createdAt: string
    updatedAt: string
    totalAmount: number
    status: string
    items: OrderItemsData[]
}

