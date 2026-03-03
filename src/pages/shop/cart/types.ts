

export type OrderData = {
    id?: string
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
    // May be a numeric variant ID (when initially added) or a populated object after enrichment
    variant?: string | variantData
}

export type variantData = {
    id?: string
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

