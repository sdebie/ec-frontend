import {z} from 'zod'

export const testimonialFormSchema = z.object({
    quote: z.string().min(1, 'Quote is required'),
    authorName: z.string().min(1, 'Author name is required'),
    authorTitle: z.string().optional(),
    sortOrder: z.number().int().min(0, 'Sort order must be non-negative'),
    published: z.boolean(),
})

export type TestimonialFormData = z.infer<typeof testimonialFormSchema>
