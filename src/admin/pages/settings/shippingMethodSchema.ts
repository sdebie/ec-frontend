import { z } from 'zod'

export const shippingMethodSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  baseFee: z.coerce.number().min(0, 'Base fee must be 0 or greater'),
  estimatedDays: z.string().min(1, 'Estimated days is required'),
  active: z.boolean(),
})

export type ShippingMethodFormValues = z.infer<typeof shippingMethodSchema>
