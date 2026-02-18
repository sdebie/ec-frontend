

export type OrderItemsData = {
    unit_price: number
    quantity: number
}
export type OrderData = {
    id: string
    createdAt: string
    updatedAt: string
    amount: number
    status: string
    items: OrderItemsData[]
}

