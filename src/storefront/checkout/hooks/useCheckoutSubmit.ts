import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useCheckoutSessionStore} from '../store/checkoutSessionStore'
import {applyServerTotals, toContactPayload} from '../mappers'
import {submitPayFastForm} from '../utils/submitPayFastForm'
import {useConfirmInStorePayment} from './useConfirmInStorePayment'
import {useInitiatePayment} from './useInitiatePayment'
import {useSubmitContact} from './useSubmitContact'
import type {CheckoutFormValues} from '../checkoutFormSchema'

/**
 * Owns placing the order: save the contact and delivery choice, take the server's
 * recomputed totals, then either hand off to the gateway or land on the
 * confirmation.
 *
 * The totals step is not incidental. The order was priced at creation against
 * the default delivery estimate, so the session's figures are provisional until
 * a method is chosen; the contact response carries the real ones, and applying
 * them means the amount the shopper last saw is the amount the gateway charges.
 */
export function useCheckoutSubmit(orderId: string) {
    const navigate = useNavigate()
    const submitContact = useSubmitContact(orderId)
    const initiatePayment = useInitiatePayment()
    const confirmInStorePayment = useConfirmInStorePayment()

    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function placeOrder(values: CheckoutFormValues) {
        setError(null)
        setIsSubmitting(true)

        let totals
        try {
            totals = await submitContact.mutateAsync(toContactPayload(values))
        } catch {
            setError('Could not save your details. Please try again.')
            setIsSubmitting(false)
            return
        }

        const store = useCheckoutSessionStore.getState()
        const session = store.session
        if (session) {
            store.setSession(applyServerTotals(session, totals))
        }

        if (values.paymentMethod === 'PAYFAST') {
            try {
                const response = await initiatePayment.mutateAsync({
                    orderId,
                    email: values.email,
                })
                submitPayFastForm(response.gatewayUrl, response.fields)
            } catch {
                setError('Could not start the payment. Please try again.')
                setIsSubmitting(false)
            }
            return
        }

        // Pay-at-collection needs confirming on the server before the shopper
        // leaves, exactly as PayFast needs its handoff. Navigating without it
        // strands the order at CREATED, where the stock-recovery sweep treats it
        // as an abandoned cart and cancels it.
        try {
            await confirmInStorePayment.mutateAsync(orderId)
        } catch {
            setError('Could not place your order. Please try again.')
            setIsSubmitting(false)
            return
        }

        navigate(`/checkout/success?sessionId=${session?.sessionId ?? ''}`)
    }

    return {placeOrder, isSubmitting, error}
}
