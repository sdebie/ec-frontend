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
    // Variant can be an ID string (pre-enrichment) or a populated object (post-enrichment)
    variant?: variantData
}

export type variantData = {
    id?: string
    stockQuantity?: number
    weightKg?: number
    attributesJson?: string
    images?: productImageData[]
    product?: productData
}

export type productImageData = {
    id?: string
    imageUrl?: string
    sortOrder?: number | null
    isFeatured?: boolean | null
}

export type productData = {
    name: string
}

export type CustomerInformation = {
    email?: string
}

