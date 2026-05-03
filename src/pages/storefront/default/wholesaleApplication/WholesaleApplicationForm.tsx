import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {toast} from '@/components/shared/toast';

const optionalEmail = z
    .string()
    .trim()
    .refine((value) => value === '' || z.string().email().safeParse(value).success, {
        message: 'Enter a valid email or leave this blank',
    });

const wholesaleApplicationSchema = z.object({
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

type WholesaleApplicationValues = z.infer<typeof wholesaleApplicationSchema>;

const inputClassName =
    'block w-full rounded-md bg-(--sf-panel) px-3.5 py-2 text-base text-(--sf-text) outline-1 -outline-offset-1 outline-(--sf-border) placeholder:text-(--sf-muted-text) focus:outline-2 focus:-outline-offset-2 focus:outline-(--sf-accent)';

const labelClassName = 'block text-sm/6 font-semibold text-(--sf-text)';

function FieldError({message}: {message?: string}) {
    if (!message) return null;
    return (
        <p className="mt-1 text-sm text-red-600" role="alert">
            {message}
        </p>
    );
}

export function WholesaleApplicationForm({formClassName = 'mt-6 space-y-10'}: {formClassName?: string}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting},
    } = useForm({
        resolver: zodResolver(wholesaleApplicationSchema),
        defaultValues: {
            applicantName: '',
            applicantEmail: '',
            applicantPhone: '',
            existingWebsiteAccountEmail: '',
            companyName: '',
            tradingName: '',
            companyPhone: '',
            companyEmail: '',
            companyRegistrationNumber: '',
            vatNumber: '',
            companyAddress: '',
            deliveryAddress: '',
            financialContactName: '',
            financialContactEmail: '',
            financialContactPhone: '',
            purchaseOrderRequired: '',
            notes: '',
        },
    });

    const submitApplication = async (data: WholesaleApplicationValues) => {
        await Promise.resolve();
        console.info('[wholesale-application]', data);
        toast.success(
            'Thank you. Your wholesale application has been recorded. We will contact you after review.',
        );
        reset();
    };

    return (
        <form
            onSubmit={handleSubmit(async (formData) => {
                await submitApplication(formData as WholesaleApplicationValues);
            })}
            className={formClassName}
            noValidate
        >
            <fieldset className="space-y-6">
                <legend className="text-base font-semibold text-(--sf-text)">Applicant details</legend>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="applicantName" className={labelClassName}>
                            Applicant name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="applicantName"
                                type="text"
                                autoComplete="name"
                                className={inputClassName}
                                {...register('applicantName')}
                            />
                            <FieldError message={errors.applicantName?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="applicantEmail" className={labelClassName}>
                            Applicant email
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="applicantEmail"
                                type="email"
                                autoComplete="email"
                                className={inputClassName}
                                {...register('applicantEmail')}
                            />
                            <FieldError message={errors.applicantEmail?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="applicantPhone" className={labelClassName}>
                            Applicant phone
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="applicantPhone"
                                type="tel"
                                autoComplete="tel"
                                className={inputClassName}
                                {...register('applicantPhone')}
                            />
                            <FieldError message={errors.applicantPhone?.message}/>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="existingWebsiteAccountEmail" className={labelClassName}>
                            Existing website account email{' '}
                            <span className="font-normal text-(--sf-muted-text)">(recommended)</span>
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="existingWebsiteAccountEmail"
                                type="email"
                                autoComplete="email"
                                className={inputClassName}
                                {...register('existingWebsiteAccountEmail')}
                            />
                            <FieldError message={errors.existingWebsiteAccountEmail?.message}/>
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-6">
                <legend className="text-base font-semibold text-(--sf-text)">Company details</legend>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="companyName" className={labelClassName}>
                            Company name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="companyName"
                                type="text"
                                autoComplete="organization"
                                className={inputClassName}
                                {...register('companyName')}
                            />
                            <FieldError message={errors.companyName?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="tradingName" className={labelClassName}>
                            Trading name{' '}
                            <span className="font-normal text-(--sf-muted-text)">(if different)</span>
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="tradingName"
                                type="text"
                                className={inputClassName}
                                {...register('tradingName')}
                            />
                            <FieldError message={errors.tradingName?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="companyPhone" className={labelClassName}>
                            Company phone
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="companyPhone"
                                type="tel"
                                autoComplete="tel"
                                className={inputClassName}
                                {...register('companyPhone')}
                            />
                            <FieldError message={errors.companyPhone?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="companyEmail" className={labelClassName}>
                            Company email
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="companyEmail"
                                type="email"
                                autoComplete="email"
                                className={inputClassName}
                                {...register('companyEmail')}
                            />
                            <FieldError message={errors.companyEmail?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="companyRegistrationNumber" className={labelClassName}>
                            Company registration number
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="companyRegistrationNumber"
                                type="text"
                                className={inputClassName}
                                {...register('companyRegistrationNumber')}
                            />
                            <FieldError message={errors.companyRegistrationNumber?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="vatNumber" className={labelClassName}>
                            VAT number
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="vatNumber"
                                type="text"
                                className={inputClassName}
                                {...register('vatNumber')}
                            />
                            <FieldError message={errors.vatNumber?.message}/>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="companyAddress" className={labelClassName}>
                            Company address
                        </label>
                        <div className="mt-2.5">
                            <textarea
                                id="companyAddress"
                                rows={4}
                                className={inputClassName}
                                {...register('companyAddress')}
                            />
                            <FieldError message={errors.companyAddress?.message}/>
                        </div>
                    </div>
                    <div className="sm:col-span-2">
                        <label htmlFor="deliveryAddress" className={labelClassName}>
                            Delivery address{' '}
                            <span className="font-normal text-(--sf-muted-text)">(if different)</span>
                        </label>
                        <div className="mt-2.5">
                            <textarea
                                id="deliveryAddress"
                                rows={3}
                                className={inputClassName}
                                {...register('deliveryAddress')}
                            />
                            <FieldError message={errors.deliveryAddress?.message}/>
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-6">
                <legend className="text-base font-semibold text-(--sf-text)">Financial / accounts contact</legend>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="financialContactName" className={labelClassName}>
                            Financial / accounts contact name
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="financialContactName"
                                type="text"
                                autoComplete="name"
                                className={inputClassName}
                                {...register('financialContactName')}
                            />
                            <FieldError message={errors.financialContactName?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="financialContactEmail" className={labelClassName}>
                            Financial / accounts email
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="financialContactEmail"
                                type="email"
                                autoComplete="email"
                                className={inputClassName}
                                {...register('financialContactEmail')}
                            />
                            <FieldError message={errors.financialContactEmail?.message}/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="financialContactPhone" className={labelClassName}>
                            Financial / accounts phone
                        </label>
                        <div className="mt-2.5">
                            <input
                                id="financialContactPhone"
                                type="tel"
                                autoComplete="tel"
                                className={inputClassName}
                                {...register('financialContactPhone')}
                            />
                            <FieldError message={errors.financialContactPhone?.message}/>
                        </div>
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-6">
                <legend className="text-base font-semibold text-(--sf-text)">Additional information</legend>
                <div>
                    <label htmlFor="purchaseOrderRequired" className={labelClassName}>
                        Purchase order required?
                    </label>
                    <div className="mt-2.5">
                        <select
                            id="purchaseOrderRequired"
                            className={inputClassName}
                            {...register('purchaseOrderRequired')}
                        >
                            <option value="" disabled>
                                Select an option
                            </option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                        <FieldError message={errors.purchaseOrderRequired?.message}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="notes" className={labelClassName}>
                        Notes
                    </label>
                    <div className="mt-2.5">
                        <textarea id="notes" rows={4} className={inputClassName} {...register('notes')}/>
                        <FieldError message={errors.notes?.message}/>
                    </div>
                </div>
            </fieldset>

            <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-(--sf-accent) px-3.5 py-2.5 text-center text-sm font-semibold text-(--sf-accent-text) shadow-xs hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-accent) disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
                >
                    {isSubmitting ? 'Submitting…' : 'Submit application'}
                </button>
            </div>
        </form>
    );
}
