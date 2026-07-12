import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { OrderSummary } from './components/OrderSummary'
import { ContactSection } from './components/ContactSection'
import { ShippingSection } from './components/ShippingSection'
import { PaymentSection } from './components/PaymentSection'

import { useSubmitContact } from './hooks/useSubmitContact'
import { useInitiatePayment } from './hooks/useInitiatePayment'
import { useShippingMethods } from './hooks/useShippingMethods'
import { usePaymentMethods } from './hooks/usePaymentMethods'

import { submitPayFastForm } from './utils/submitPayFastForm'
import { useCheckoutSessionStore } from './checkoutSessionStore'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { checkoutFormSchema, type CheckoutFormValues } from './checkoutFormSchema'
import { isDeliveryMethod } from './utils/isDeliveryMethod'

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('orderId') ?? ''

  const session = useCheckoutSessionStore((state) => state.session)
  const { isSignedIn, email, firstName, lastName } = useCustomerAuthStore()

  const { data: shippingMethods } = useShippingMethods()
  const { data: paymentMethods } = usePaymentMethods()

  const submitContact = useSubmitContact(orderId)
  const initiatePayment = useInitiatePayment()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      shippingMethodId: '',
      streetAddress: '',
      city: '',
      province: '',
      postalCode: '',
      paymentMethod: '',
    },
  })

  const { control, handleSubmit, setError, setValue, watch, formState: { errors } } = methods

  // Pre-fill form when authenticated
  useEffect(() => {
    if (isSignedIn) {
      if (email) setValue('email', email)
      if (firstName) setValue('firstName', firstName)
      if (lastName) setValue('lastName', lastName)
    }
  }, [isSignedIn, email, firstName, lastName, setValue])

  // Expired session fallback
  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-(--sf-text)">Session expired</h1>
        <p className="mt-2 text-(--sf-muted-text)">
          Your checkout session has expired. Return to cart to start again.
        </p>
        <Link
          to="/cart"
          className="mt-4 inline-block rounded-md bg-(--sf-accent) px-4 py-2 text-sm font-medium text-(--sf-accent-text) hover:opacity-90"
        >
          Return to cart
        </Link>
      </div>
    )
  }

  const onSubmit = async (data: CheckoutFormValues) => {
    setSubmitError(null)

    // Address validation for delivery methods
    const selectedMethod = shippingMethods?.find((m) => m.id === data.shippingMethodId)
    if (selectedMethod && isDeliveryMethod(selectedMethod)) {
      let hasAddressError = false
      if (!data.streetAddress) {
        setError('streetAddress', { message: 'Street address is required' })
        hasAddressError = true
      }
      if (!data.city) {
        setError('city', { message: 'City is required' })
        hasAddressError = true
      }
      if (!data.province) {
        setError('province', { message: 'Province is required' })
        hasAddressError = true
      }
      if (!data.postalCode) {
        setError('postalCode', { message: 'Postal code is required' })
        hasAddressError = true
      }
      if (hasAddressError) return
    }

    setIsSubmitting(true)

    try {
      // PATCH contact details
      await submitContact.mutateAsync({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        shippingMethodId: data.shippingMethodId,
        streetAddress: data.streetAddress || undefined,
        city: data.city || undefined,
        province: data.province || undefined,
        postalCode: data.postalCode || undefined,
      })
    } catch {
      setSubmitError('Could not save contact details. Please try again.')
      setIsSubmitting(false)
      return
    }

    if (data.paymentMethod === 'PAYFAST') {
      try {
        const response = await initiatePayment.mutateAsync({
          orderId,
          email: data.email,
        })
        submitPayFastForm(response.gatewayUrl, response.fields)
      } catch {
        setSubmitError('Could not initiate payment. Please try again.')
        setIsSubmitting(false)
      }
    } else {
      // In-store payment — navigate to success
      navigate(`/checkout/success?sessionId=${session.sessionId}`)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-(--sf-text) mb-8">Checkout</h1>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ContactSection
                control={control}
                isAuthenticated={isSignedIn}
                customerProfile={
                  isSignedIn && email
                    ? { email, firstName: firstName ?? '', lastName: lastName ?? '' }
                    : null
                }
              />

              <ShippingSection
                control={control}
                watch={watch}
                errors={errors}
                setValue={setValue}
              />

              <PaymentSection
                control={control}
                paymentMethods={paymentMethods ?? []}
              />

              {submitError && (
                <p className="text-sm text-red-600" role="alert">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (paymentMethods?.length === 0)}
                className="w-full rounded-md bg-(--sf-accent) px-6 py-3 text-sm font-medium text-(--sf-accent-text) hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing…' : 'Place order'}
              </button>
            </div>

            <div className="lg:col-span-1">
              <OrderSummary />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
