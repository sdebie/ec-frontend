

export type OrderData = {
    id?: number
    sessionId?: string
    createdAt?: string
    updatedAt?: string
    totalAmount?: number
    status?: string
    items?: OrderItemsData[]
}

export type OrderItemsData = {
    unitPrice?: number
    quantity?: number
    variant?: variantData
}

export type variantData = {
    id?: number
    stockQuantity?: number
    weightKg?: number
    attributesJson?: string
    product?: productData
}

export type productData = {
    name: string
}

export type CustomerInformation = {
    email?: string
}

