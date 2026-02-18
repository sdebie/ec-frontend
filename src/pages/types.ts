

export type OrderItemsData = {
    unitPrice?: number
    quantity?: number
}
export type OrderData = {
    id?: number
    createdAt?: string
    updatedAt?: string
    totalAmount?: number
    status?: string
    items?: OrderItemsData[]
}

