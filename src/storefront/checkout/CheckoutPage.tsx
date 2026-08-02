import {useEffect} from 'react'
import {Link, useSearchParams} from 'react-router-dom'
import {ChevronLeft} from 'lucide-react'
import {FormProvider, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {CheckoutShell} from './components/CheckoutShell'
import {CheckoutNotice} from './components/CheckoutNotice'
import {OrderSummary} from './components/OrderSummary'
import {ContactSection} from './components/ContactSection'
import {ShippingSection} from './components/ShippingSection'
import {PaymentSection} from './components/PaymentSection'
import {useCheckoutSubmit} from './hooks/useCheckoutSubmit'
import {useShippingMethods} from './hooks/useShippingMethods'
import {usePaymentMethods} from './hooks/usePaymentMethods'
import {useCheckoutSessionStore} from './store/checkoutSessionStore'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {checkoutFormSchema, type CheckoutFormValues} from './checkoutFormSchema'
import {isDeliveryMethod} from './utils/isDeliveryMethod'

/**
 * Orchestrates checkout: owns the form and the only writes to it, and delegates
 * every screenful to a component — `ContactSection`, `ShippingSection`,
 * `PaymentSection`, `OrderSummary`, and `CheckoutNotice` for the states that are
 * not the form. Placing the order lives in `useCheckoutSubmit`.
 *
 * The sections receive capabilities, never the form object (law 14), so the page
 * is the single place form state is mutated.
 */
export function CheckoutPage() {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('orderId') ?? ''

    const session = useCheckoutSessionStore((state) => state.session)
    const {isSignedIn, email, firstName, lastName} = useCustomerAuthStore()

    const {data: shippingMethods} = useShippingMethods()
    const {data: paymentMethods} = usePaymentMethods()

    const {placeOrder, isSubmitting, error: submitError} = useCheckoutSubmit(orderId)

    const methods = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            shippingMethodId: '',
            requiresAddress: false,
            streetAddress: '',
            city: '',
            province: '',
            postalCode: '',
            paymentMethod: '',
        },
    })

    const {control, handleSubmit, setValue, watch, formState: {errors}} = methods

    const selectedMethodId = watch('shippingMethodId')
    const selectedMethod = shippingMethods?.find((m) => m.id === selectedMethodId) ?? null
    const requiresAddress = selectedMethod ? isDeliveryMethod(selectedMethod) : false

    // Pre-fill from the signed-in profile
    useEffect(() => {
        if (!isSignedIn) return
        if (email) setValue('email', email)
        if (firstName) setValue('firstName', firstName)
        if (lastName) setValue('lastName', lastName)
    }, [isSignedIn, email, firstName, lastName, setValue])

    // Mirror the delivery decision into the form so the schema can enforce the
    // address rule, and clear the address when the shopper switches to a method
    // that collects — a collection order must not carry a stale address. Both
    // are form writes, so they live here rather than inside the section.
    useEffect(() => {
        setValue('requiresAddress', requiresAddress, {shouldValidate: false})
        if (requiresAddress) return
        setValue('streetAddress', '', {shouldValidate: false})
        setValue('city', '', {shouldValidate: false})
        setValue('province', '', {shouldValidate: false})
        setValue('postalCode', '', {shouldValidate: false})
    }, [requiresAddress, setValue])

    // A lone payment method is the decision — select it rather than asking.
    useEffect(() => {
        if (paymentMethods?.length === 1) {
            setValue('paymentMethod', paymentMethods[0], {shouldValidate: false})
        }
    }, [paymentMethods, setValue])

    if (!session) {
        return (
            <CheckoutShell>
                <CheckoutNotice
                    heading="Your checkout session has expired"
                    body="Your cart is still saved on this device. Return to it to pick up where you left off."
                    action={{label: 'Return to cart', to: '/cart'}}
                />
            </CheckoutShell>
        )
    }

    const unitCount = session.lines.reduce((sum, line) => sum + line.quantity, 0)

    return (
        <CheckoutShell>
            {/* Toolbar row — the catalogue's, wishlist's and cart's rhythm: one
                line of context above a divider. Here it also carries the way
                back: a shopper who spots something wrong in the summary must not
                have to use the browser's back button to fix it. */}
            <div className="mt-3 flex items-center justify-between gap-4 border-b border-(--sf-border) pb-4">
                <Link
                    to="/cart"
                    className="inline-flex items-center gap-1 text-sm font-medium text-(--sf-muted-text) underline-offset-4 transition-colors hover:text-(--sf-text) hover:underline"
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true"/>
                    Back to cart
                </Link>
                <p className="text-sm text-(--sf-muted-text)">
                    {unitCount} {unitCount === 1 ? 'item' : 'items'} in this order
                </p>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(placeOrder)} noValidate>
                    {/* 5/9 form, 4/9 summary on lg+. The form's fields do not
                        benefit from extra width, while the summary carries line
                        items whose names wrap when the column is narrow. */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-9 lg:gap-8">
                        <div className="space-y-4 lg:col-span-5">
                            <ContactSection
                                control={control}
                                isAuthenticated={isSignedIn}
                                customerProfile={
                                    isSignedIn && email
                                        ? {email, firstName: firstName ?? '', lastName: lastName ?? ''}
                                        : null
                                }
                            />

                            <ShippingSection control={control} errors={errors}/>

                            <PaymentSection control={control} paymentMethods={paymentMethods ?? []}/>

                            {submitError && (
                                <p className="text-sm text-(--sf-error)" role="alert">
                                    {submitError}
                                </p>
                            )}

                            <div className="space-y-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || paymentMethods?.length === 0}
                                    className="min-h-11 w-full cursor-pointer rounded-lg bg-(--sf-accent) px-6 py-3 text-sm font-medium text-(--sf-accent-text) transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing…' : 'Place order'}
                                </button>
                                <p className="text-center text-xs text-(--sf-muted-text)">
                                    Your order is only confirmed once payment completes.
                                </p>
                            </div>
                        </div>

                        {/* Summary first below lg, as the cart and wishlist do, so the
                            total stays reachable without scrolling past the form. */}
                        <div className="order-first lg:order-none lg:col-span-4">
                            <OrderSummary selectedShippingFee={selectedMethod?.baseFee ?? null}/>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </CheckoutShell>
    )
}
