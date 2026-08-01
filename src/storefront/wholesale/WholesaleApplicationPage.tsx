import {useState} from 'react'
import {Link} from 'react-router-dom'
import {Controller, useForm, type UseFormReturn} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {
    type WholesaleApplicationFormInput,
    type WholesaleApplicationFormValues,
    wholesaleApplicationSchema,
} from './wholesaleApplicationSchema'
import {useWholesaleApplicationSubmit} from './useWholesaleApplicationSubmit'
import {toDto} from './mappers'
import {Checkbox, InputField, Textarea} from '@/shared/ui/components'

/** Delivery-address fields are disabled while they mirror the company address. */
const DISABLED_CLASSES = 'disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionProps {
    form: UseFormReturn<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>
}

interface PostalSectionProps extends SectionProps {
    sameAsPhysical: boolean
}

// ---------------------------------------------------------------------------
// SuccessCard
// ---------------------------------------------------------------------------

function SuccessCard() {
    return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
            <div className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-8 shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--c-success)/10">
                    <svg
                        className="h-6 w-6 text-(--c-success)"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-(--sf-text)">Application submitted</h2>
                <p className="mt-3 text-(--sf-muted-text)">
                    Thank you. Your wholesale application has been received. We will review your details and
                    contact you within 2–3 business days.
                </p>
                <p className="mt-2 text-sm text-(--sf-muted-text)">
                    Once approved, you will receive an email with a link to set your password and access your
                    wholesale account.
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-block rounded-md bg-(--sf-accent) px-5 py-2.5 text-sm font-medium text-(--sf-accent-text) hover:opacity-90"
                >
                    Return to home
                </Link>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// ApplicantSection
// ---------------------------------------------------------------------------

function ApplicantSection({form}: SectionProps) {
    const {
        register,
        formState: {errors},
    } = form

    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Applicant Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <InputField
                        id="firstName"
                        type="text"
                        required
                        label="First Name"
                        error={errors.firstName?.message}
                        {...register('firstName')}
                    />
                </div>

                <div>
                    <InputField
                        id="lastName"
                        type="text"
                        required
                        label="Last Name"
                        error={errors.lastName?.message}
                        {...register('lastName')}
                    />
                </div>

                <div>
                    <InputField
                        id="applicantEmail"
                        type="email"
                        required
                        label="Email"
                        error={errors.applicantEmail?.message}
                        {...register('applicantEmail')}
                    />
                </div>

                <div>
                    <InputField
                        id="accountEmail"
                        type="email"
                        label="Existing website account email (recommended)"
                        error={errors.accountEmail?.message}
                        {...register('accountEmail')}
                    />
                </div>

                <div>
                    <InputField
                        id="phone"
                        type="tel"
                        required
                        label="Phone"
                        error={errors.phone?.message}
                        {...register('phone')}
                    />
                </div>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// CompanySection
// ---------------------------------------------------------------------------

function CompanySection({form}: SectionProps) {
    const {
        register,
        formState: {errors},
    } = form

    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Company Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputField
                        id="companyName"
                        type="text"
                        required
                        label="Company Name"
                        error={errors.companyName?.message}
                        {...register('companyName')}
                    />
                </div>

                <div className="sm:col-span-2">
                    <InputField
                        id="tradingName"
                        type="text"
                        label="Trading name (if different)"
                        {...register('tradingName')}
                    />
                </div>

                <div>
                    <InputField
                        id="companyPhone"
                        type="text"
                        label="Company phone"
                        {...register('companyPhone')}
                    />
                </div>

                <div>
                    <InputField
                        id="companyEmail"
                        type="email"
                        label="Company email"
                        error={errors.companyEmail?.message}
                        {...register('companyEmail')}
                    />
                </div>

                <div>
                    <InputField
                        id="vatNumber"
                        type="text"
                        label="VAT Number"
                        error={errors.vatNumber?.message}
                        {...register('vatNumber')}
                    />
                </div>

                <div>
                    <InputField
                        id="regNumber"
                        type="text"
                        label="Registration Number"
                        error={errors.regNumber?.message}
                        {...register('regNumber')}
                    />
                </div>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// PhysicalAddressSection
// ---------------------------------------------------------------------------

function PhysicalAddressSection({form}: SectionProps) {
    const {
        register,
        formState: {errors},
    } = form

    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Company Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputField
                        id="physicalAddressLine1"
                        type="text"
                        required
                        label="Address Line 1"
                        error={errors.physicalAddressLine1?.message}
                        {...register('physicalAddressLine1')}
                    />
                </div>

                <div className="sm:col-span-2">
                    <InputField
                        id="physicalAddressLine2"
                        type="text"
                        label="Address Line 2"
                        {...register('physicalAddressLine2')}
                    />
                </div>

                <div>
                    <InputField
                        id="physicalSuburb"
                        type="text"
                        label="Suburb"
                        error={errors.physicalSuburb?.message}
                        {...register('physicalSuburb')}
                    />
                </div>

                <div>
                    <InputField
                        id="physicalCity"
                        type="text"
                        required
                        label="City"
                        error={errors.physicalCity?.message}
                        {...register('physicalCity')}
                    />
                </div>

                <div>
                    <InputField
                        id="physicalProvince"
                        type="text"
                        required
                        label="Province"
                        error={errors.physicalProvince?.message}
                        {...register('physicalProvince')}
                    />
                </div>

                <div>
                    <InputField
                        id="physicalPostalCode"
                        type="text"
                        required
                        label="Postal Code"
                        error={errors.physicalPostalCode?.message}
                        {...register('physicalPostalCode')}
                    />
                </div>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// PostalAddressSection
// ---------------------------------------------------------------------------

function PostalAddressSection({form, sameAsPhysical}: PostalSectionProps) {
    const {
        register,
        control,
        formState: {errors},
    } = form

    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Delivery Address (if different from company
                address)</h2>

            <Controller
                control={control}
                name="sameAsPhysical"
                render={({field}) => (
                    <Checkbox
                        className="mb-4"
                        label="Same as company address"
                        checked={!!field.value}
                        onChange={field.onChange}
                    />
                )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputField
                        id="postalAddressLine1"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Address Line 1"
                        className={DISABLED_CLASSES}
                        error={errors.postalAddressLine1?.message}
                        {...register('postalAddressLine1')}
                    />
                </div>

                <div className="sm:col-span-2">
                    <InputField
                        id="postalAddressLine2"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Address Line 2"
                        className={DISABLED_CLASSES}
                        {...register('postalAddressLine2')}
                    />
                </div>

                <div>
                    <InputField
                        id="postalSuburb"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Suburb"
                        className={DISABLED_CLASSES}
                        error={errors.postalSuburb?.message}
                        {...register('postalSuburb')}
                    />
                </div>

                <div>
                    <InputField
                        id="postalCity"
                        type="text"
                        disabled={sameAsPhysical}
                        label="City"
                        className={DISABLED_CLASSES}
                        error={errors.postalCity?.message}
                        {...register('postalCity')}
                    />
                </div>

                <div>
                    <InputField
                        id="postalProvince"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Province"
                        className={DISABLED_CLASSES}
                        error={errors.postalProvince?.message}
                        {...register('postalProvince')}
                    />
                </div>

                <div>
                    <InputField
                        id="postalPostalCode"
                        type="text"
                        disabled={sameAsPhysical}
                        label="Postal Code"
                        className={DISABLED_CLASSES}
                        error={errors.postalPostalCode?.message}
                        {...register('postalPostalCode')}
                    />
                </div>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// FinanceContactSection
// ---------------------------------------------------------------------------

function FinanceContactSection({form}: SectionProps) {
    const {
        register,
        formState: {errors},
    } = form

    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Financial / Accounts Contact</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <InputField
                        id="financeContactName"
                        type="text"
                        label="Financial / accounts contact name"
                        error={errors.financeContactName?.message}
                        {...register('financeContactName')}
                    />
                </div>

                <div>
                    <InputField
                        id="financeContactEmail"
                        type="email"
                        label="Financial / accounts email"
                        error={errors.financeContactEmail?.message}
                        {...register('financeContactEmail')}
                    />
                </div>

                <div>
                    <InputField
                        id="financeContactPhone"
                        type="tel"
                        label="Financial / accounts phone"
                        error={errors.financeContactPhone?.message}
                        {...register('financeContactPhone')}
                    />
                </div>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// PurchaseOrderSection
// ---------------------------------------------------------------------------

function PurchaseOrderSection({form}: SectionProps) {
    const {control} = form

    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Purchase Orders</h2>
            <Controller
                control={control}
                name="purchaseOrderRequired"
                render={({field}) => (
                    <Checkbox
                        label="Do you require purchase orders?"
                        checked={!!field.value}
                        onChange={field.onChange}
                    />
                )}
            />
        </section>
    )
}

// ---------------------------------------------------------------------------
// NotesSection
// ---------------------------------------------------------------------------

function NotesSection({form}: SectionProps) {
    const {
        register,
        formState: {errors},
    } = form

    return (
        <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Additional Notes</h2>
            <div>
                <Textarea
                    id="notes"
                    rows={4}
                    label="Notes"
                    error={errors.notes?.message}
                    placeholder="Tell us about your business, expected order volumes, or any other relevant details..."
                    {...register('notes')}
                />
                <p className="mt-1 text-xs text-(--sf-muted-text)">Maximum 1000 characters</p>
            </div>
        </section>
    )
}

// ---------------------------------------------------------------------------
// WholesaleApplicationPage
// ---------------------------------------------------------------------------

export function WholesaleApplicationPage() {
    const [submitted, setSubmitted] = useState(false)
    const {mutate, isPending} = useWholesaleApplicationSubmit()
    const form = useForm<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>({
        resolver: zodResolver(wholesaleApplicationSchema),
        mode: 'onTouched',
        defaultValues: {sameAsPhysical: false},
    })
    const sameAsPhysical = form.watch('sameAsPhysical') ?? false

    if (submitted) return <SuccessCard/>

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-(--sf-text)">Wholesale Application</h1>
                <p className="mt-2 text-(--sf-muted-text)">
                    To apply for a wholesale account, please complete the application form below. Once your
                    application is approved, you will be able to log in and wholesale pricing will be used
                    when you shop and add products to your cart.
                </p>
                <p className="mt-2 text-(--sf-muted-text)">
                    You need a normal website account first. If you have not created one yet, you can{' '}
                    <Link to="/account/register" className="text-(--sf-accent) underline hover:opacity-80">
                        create a normal account
                    </Link>{' '}
                    for now. When your wholesale application is approved, your existing account will be
                    upgraded to a wholesale account (your username and password will stay the same).
                </p>
            </div>

            <form
                onSubmit={form.handleSubmit(
                    (values) => mutate(toDto(values), {onSuccess: () => setSubmitted(true)}),
                    (errors) => {
                        const firstErrorKey = Object.keys(errors)[0]
                        if (firstErrorKey) {
                            const element = document.querySelector(`[name="${firstErrorKey}"]`)
                            element?.scrollIntoView({behavior: 'smooth', block: 'center'})
                        }
                    }
                )}
                noValidate
                className="space-y-6"
            >
                <ApplicantSection form={form}/>
                <CompanySection form={form}/>
                <PhysicalAddressSection form={form}/>
                <PostalAddressSection form={form} sameAsPhysical={sameAsPhysical}/>
                <FinanceContactSection form={form}/>
                <PurchaseOrderSection form={form}/>
                <NotesSection form={form}/>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-md bg-(--sf-accent) px-6 py-3 text-sm font-medium text-(--sf-accent-text) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending ? 'Submitting...' : 'Submit Application'}
                </button>
            </form>
        </div>
    )
}
