import {useState} from 'react'
import {Link} from 'react-router-dom'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
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

export function WholesaleApplicationPage() {
    const [submitted, setSubmitted] = useState(false)
    const {mutate, isPending} = useWholesaleApplicationSubmit()
    const form = useForm<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>({
        resolver: zodResolver(wholesaleApplicationSchema),
        mode: 'onTouched',
        defaultValues: {sameAsPhysical: false},
    })
    const sameAsPhysical = form.watch('sameAsPhysical') ?? false
    const {register, control, formState: {errors}} = form

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
                <ApplicantSection register={register} errors={errors}/>
                <CompanySection register={register} errors={errors}/>
                <PhysicalAddressSection register={register} errors={errors}/>
                <PostalAddressSection
                    register={register}
                    control={control}
                    errors={errors}
                    sameAsPhysical={sameAsPhysical}
                />
                <FinanceContactSection register={register} errors={errors}/>
                <PurchaseOrderSection control={control}/>
                <NotesSection register={register} errors={errors}/>

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
