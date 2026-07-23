export interface AdminTestimonial {
    id: string
    quote: string
    authorName: string
    authorTitle: string | null
    published: boolean
    sortOrder: number
    createdAt: string
    updatedAt: string
}

export interface CreateTestimonialPayload {
    quote: string
    authorName: string
    authorTitle?: string
    sortOrder: number
    published: boolean
}

export interface UpdateTestimonialPayload extends CreateTestimonialPayload {}
