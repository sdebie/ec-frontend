import {z} from 'zod';

export const optionalEmail = z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, {
        message: 'Enter a valid email or leave this blank',
    });

export const wholesaleApplicationSchema = z.object({
    applicantName: z.string().trim().min(1, 'Applicant name is required'),
    applicantEmail: z.string().trim().email('Enter a valid email'),
    applicantPhone: z.string().trim().min(1, 'Applicant phone is required'),
    existingWebsiteAccountEmail: optionalEmail,
    companyName: z.string().trim().min(1, 'Company name is required'),
    tradingName: z.string().trim().optional(),
    companyPhone: z.string().trim().min(1, 'Company phone is required'),
    companyEmail: z.string().trim().email('Enter a valid company email'),
    companyRegistrationNumber: z.string().trim().min(1, 'Company registration number is required'),
    vatNumber: z.string().trim().optional(),
    companyAddress: z.string().trim().min(1, 'Company address is required'),
    deliveryAddress: z.string().trim().optional(),
    financialContactName: z.string().trim().min(1, 'Financial contact name is required'),
    financialContactEmail: z.string().trim().email('Enter a valid financial contact email'),
    financialContactPhone: z.string().trim().min(1, 'Financial contact phone is required'),
    purchaseOrderRequired: z
        .enum(['', 'yes', 'no'])
        .refine((value) => value !== '', {
            message: 'Please select whether a purchase order is required',
        })
        .transform((value) => value as 'yes' | 'no'),
    notes: z.string().trim().optional(),
});

export type WholesaleApplicationValues = z.infer<typeof wholesaleApplicationSchema>;
