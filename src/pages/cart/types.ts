

export type OrderItemsData = {
    unitPrice?: number
    quantity?: number
    variant?: number
}
export type OrderData = {
    id?: number
    sessionId?: string
    createdAt?: string
    updatedAt?: string
    totalAmount?: number
    status?: string
    items?: OrderItemsData[]
}

export type CustomerInformation = {
    email?: string
}

