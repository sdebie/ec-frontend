

export type OrderItemsData = {
    unit_rice: number
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

