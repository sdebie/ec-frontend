import {z} from 'zod'

export const checkoutFormSchema = z
    .object({
        email: z.string().email('Please enter a valid email address'),
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        shippingMethodId: z.string().min(1, 'Please select a delivery method'),
        /**
         * Whether the selected method delivers to an address. Kept in the form so
         * the address rule can live in the schema rather than in the submit
         * handler — the page writes it when the selection changes, because only
         * the page has the loaded methods to decide it.
         */
        requiresAddress: z.boolean(),
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
        paymentMethod: z.string().min(1, 'Please select a payment method'),
    })
    .superRefine((values, ctx) => {
        // The address is only entered when the chosen method delivers — then it
        // carries the same required fields the wholesale postal address does.
        // In the schema, so these validate as the shopper types instead of only
        // when they press the button.
        if (!values.requiresAddress) return
        const required = [
            ['streetAddress', 'Street address is required'],
            ['city', 'City is required'],
            ['province', 'Province is required'],
            ['postalCode', 'Postal code is required'],
        ] as const
        for (const [field, message] of required) {
            if (!values[field]?.trim()) {
                ctx.addIssue({code: z.ZodIssueCode.custom, path: [field], message})
            }
        }
    })

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
