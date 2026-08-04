import {useEffect, useState} from 'react'
import {type FieldPath, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {ACCENT_BUTTON_HOVER, PageDivider, Section, SectionHeading, SF_FOCUS_RING_PAGE} from '@/storefront/sections/shared'
import {Stepper} from '@/shared/ui/components'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {
    type WholesaleApplicationFormInput,
    type WholesaleApplicationFormValues,
    wholesaleApplicationSchema,
} from './wholesaleApplicationSchema'
import {useWholesaleApplicationSubmit} from './hooks/useWholesaleApplicationSubmit'
import {toDto} from './mappers'
import {SuccessCard} from './components/SuccessCard'
import {ApplicantSection} from './components/ApplicantSection'
import {CompanySection} from './components/CompanySection'
import {PhysicalAddressSection} from './components/PhysicalAddressSection'
import {PostalAddressSection} from './components/PostalAddressSection'
import {FinanceContactSection} from './components/FinanceContactSection'
import {PurchaseOrderSection} from './components/PurchaseOrderSection'
import {NotesSection} from './components/NotesSection'
import {ReviewSummary} from './components/ReviewSummary'

const STEPS = [
    {id: 'applicant', label: 'Your details'},
    {id: 'company', label: 'Company'},
    {id: 'addresses', label: 'Addresses'},
    {id: 'finance', label: 'Finance'},
    {id: 'review', label: 'Review'}
]

/** Fields validated by "Next" on each step — must cover every registered field of that step. */
const STEP_FIELDS: FieldPath<WholesaleApplicationFormInput>[][] = [
    ['firstName', 'lastName', 'applicantEmail', 'accountEmail', 'phone'],
    ['companyName', 'tradingName', 'companyPhone', 'companyEmail', 'vatNumber', 'regNumber'],
    [
        'physicalAddressLine1', 'physicalAddressLine2', 'physicalSuburb', 'physicalCity',
        'physicalProvince', 'physicalPostalCode', 'sameAsPhysical',
        'postalAddressLine1', 'postalAddressLine2', 'postalSuburb', 'postalCity',
        'postalProvince', 'postalPostalCode',
    ],
    ['financeContactName', 'financeContactEmail', 'financeContactPhone', 'purchaseOrderRequired', 'notes'],
]

export function WholesaleApplicationPage() {

    const [submitted, setSubmitted] = useState(false)
    const [step, setStep] = useState(0)
    const {mutate, isPending} = useWholesaleApplicationSubmit()
    const customerEmail = useCustomerAuthStore((state) => state.email)
    const isSignedIn = !!useCustomerAuthStore((state) => state.token)

    const form = useForm<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>({
        resolver: zodResolver(wholesaleApplicationSchema),
        mode: 'onTouched',
        defaultValues: {sameAsPhysical: true},
    })

    const sameAsPhysical = form.watch('sameAsPhysical') ?? false
    const {register, control, formState: {errors}} = form

    // Prefill the account email from the signed-in session; never clobber a typed value.
    useEffect(() => {
        if (customerEmail && !form.getValues('accountEmail')) {
            form.setValue('accountEmail', customerEmail)
        }
    }, [customerEmail, form])

    if (submitted) return <SuccessCard/>

    const isLastStep = step === STEPS.length - 1

    const handleNext = async () => {
        const valid = await form.trigger(STEP_FIELDS[step], {shouldFocus: true})
        if (valid) setStep(step + 1)
    }

    return (
        <Section as="div" width="wide">
            <SectionHeading
                as="h1"
                title="Wholesale Application"
                subtitle="Apply for wholesale pricing in five quick steps — applications are reviewed within 2–3 business days."
                className="mb-4"
            />

            <PageDivider className="mb-6"/>

            <div className="rounded-lg border border-(--sf-border) bg-(--sf-panel) shadow-sm">
                <div className="border-b border-(--sf-border) px-6 py-5 sm:px-8">
                    <Stepper steps={STEPS} activeStep={step} onStepClick={setStep} className="mx-auto max-w-xl"/>
                </div>

                <form
                    onSubmit={form.handleSubmit(
                        (values) => mutate(toDto(values), {onSuccess: () => setSubmitted(true)}),
                        (errors) => {
                            const firstErrorKey = Object.keys(errors)[0]
                            if (!firstErrorKey) return
                            // An invalid field on an earlier step is invisible here — jump to its step.
                            const stepWithError = STEP_FIELDS.findIndex((fields) =>
                                (fields as string[]).includes(firstErrorKey))
                            if (stepWithError !== -1 && stepWithError !== step) {
                                setStep(stepWithError)
                                return
                            }
                            const element = document.querySelector(`[name="${firstErrorKey}"]`)
                            element?.scrollIntoView({behavior: 'smooth', block: 'center'})
                        }
                    )}
                    noValidate
                >
                    <div className="space-y-8 px-6 py-6 sm:px-8">
                        {step === 0 && (
                            <ApplicantSection register={register} errors={errors} isSignedIn={isSignedIn}/>
                        )}
                        {step === 1 && (
                            <CompanySection register={register} errors={errors}/>
                        )}
                        {step === 2 && (
                            <div
                                className="grid divide-y divide-(--sf-border) lg:grid-cols-2 lg:items-start lg:divide-x lg:divide-y-0">
                                <div className="pb-8 lg:pb-0 lg:pr-8">
                                    <PhysicalAddressSection register={register} control={control} errors={errors}/>
                                </div>
                                <div className="pt-8 lg:pt-0 lg:pl-8">
                                    <PostalAddressSection
                                        register={register}
                                        control={control}
                                        errors={errors}
                                        sameAsPhysical={sameAsPhysical}
                                    />
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <>
                                <FinanceContactSection register={register} errors={errors}/>
                                <PurchaseOrderSection control={control}/>
                                <NotesSection register={register} errors={errors}/>
                            </>
                        )}
                        {step === 4 && (
                            <>
                                <ReviewSummary values={form.getValues()} onEdit={setStep}/>
                            </>
                        )}
                    </div>

                    <div
                        className="flex items-center justify-between gap-4 border-t border-(--sf-border) px-6 py-4 sm:px-8">
                        <span className="text-sm text-(--sf-muted-text)">
                            Step {step + 1} of {STEPS.length}
                        </span>
                        <div className="flex items-center gap-3">
                            {step > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(step - 1)}
                                    className="rounded-md border border-(--sf-border) px-5 py-2.5 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted)"
                                >
                                    Back
                                </button>
                            )}
                            {isLastStep ? (
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className={`rounded-md bg-(--sf-accent) px-5 py-2.5 text-sm font-medium text-(--sf-accent-text) transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    {isPending ? 'Submitting...' : 'Submit Application'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className={`rounded-md bg-(--sf-accent) px-5 py-2.5 text-sm font-medium text-(--sf-accent-text) transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE}`}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </Section>
    )
}
