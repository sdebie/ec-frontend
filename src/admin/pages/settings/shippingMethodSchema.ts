import { z } from 'zod'

export const shippingMethodSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  baseFee: z.coerce.number().min(0, 'Base fee must be 0 or greater'),
  estimatedDays: z.string().min(1, 'Estimated days is required'),
  active: z.boolean(),
  /**
   * Whether checkout collects a delivery address for this method. Not derivable from
   * fee or lead time — a free same-day collection and a free same-day delivery are
   * indistinguishable by those — so it is asked here and stored on the method.
   */
  requiresAddress: z.boolean(),
})

export type ShippingMethodFormValues = z.infer<typeof shippingMethodSchema>
