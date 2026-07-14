import { z } from 'zod'

export const wholesaleApplicationSchema = z.object({
  // Applicant
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required'),

  // Company
  companyName: z.string().min(1, 'Company name is required'),
  vatNumber: z.string().optional(),
  regNumber: z.string().min(1, 'Registration number is required'),

  // Physical address (required)
  physicalAddressLine1: z.string().min(1, 'Address line 1 is required'),
  physicalAddressLine2: z.string().optional(),
  physicalSuburb: z.string().min(1, 'Suburb is required'),
  physicalCity: z.string().min(1, 'City is required'),
  physicalProvince: z.string().min(1, 'Province is required'),
  physicalPostalCode: z.string().min(1, 'Postal code is required'),

  // Postal address (optional)
  sameAsPhysical: z.boolean().default(false),
  postalAddressLine1: z.string().optional(),
  postalAddressLine2: z.string().optional(),
  postalSuburb: z.string().optional(),
  postalCity: z.string().optional(),
  postalProvince: z.string().optional(),
  postalPostalCode: z.string().optional(),

  // Notes
  notes: z.string().max(1000, 'Notes must be 1000 characters or fewer').optional(),
})

// `.default(false)` makes the schema's input and output types differ (sameAsPhysical
// is optional on input, required on output). Expose both: the form fields hold the
// INPUT shape, while a validated submit produces the OUTPUT (Values) shape.
export type WholesaleApplicationFormInput = z.input<typeof wholesaleApplicationSchema>
export type WholesaleApplicationFormValues = z.output<typeof wholesaleApplicationSchema>
