import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useCheckoutSessionStore} from '../store/checkoutSessionStore'
import {applyServerTotals, toContactPayload} from '../mappers'
import {submitPayFastForm} from '../utils/submitPayFastForm'
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

        navigate(`/checkout/success?sessionId=${session?.sessionId ?? ''}`)
    }

    return {placeOrder, isSubmitting, error}
}
