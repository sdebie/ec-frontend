import {z} from 'zod'

export const requestSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
})

export const codeSchema = z
    .object({
        code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

export type RequestFormValues = z.infer<typeof requestSchema>
export type CodeFormValues = z.infer<typeof codeSchema>
