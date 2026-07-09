import { z } from 'zod'

export const checkoutFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  shippingMethodId: z.string().min(1, 'Please select a shipping method'),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
})

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
