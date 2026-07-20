import { z } from 'zod'

const staffBaseSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'], {
    required_error: 'Please select a role',
  }),
  isActive: z.boolean(),
})

export const staffCreateSchema = staffBaseSchema.extend({
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const staffEditSchema = staffBaseSchema

export type StaffCreateFormValues = z.infer<typeof staffCreateSchema>
export type StaffEditFormValues = z.infer<typeof staffEditSchema>
