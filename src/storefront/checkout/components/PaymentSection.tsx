import type {Control} from 'react-hook-form'
import {Controller} from 'react-hook-form'
import type {CheckoutFormValues} from '../checkoutFormSchema'
import {CheckoutSection} from './CheckoutSection'

/**
 * Capabilities only: `control` and the methods to offer. Auto-selecting
 * a lone method belongs to the page, which owns the form — reaching for
 * `setValue` through `useFormContext` would be a write nothing in this signature
 * discloses.
 */
interface PaymentSectionProps {
    control: Control<CheckoutFormValues>
    paymentMethods: string[]
}

const PAYMENT_LABELS: Record<string, string> = {
    PAYFAST: 'Pay online (PayFast)',
    IN_STORE: 'Pay in store at collection',
}

/** What happens after the button, so the next screen is never a surprise. */
const PAYMENT_HINTS: Record<string, string> = {
    PAYFAST: "You'll be taken to PayFast to pay securely, then back here.",
    IN_STORE: 'Pay when you collect your order.',
}

function getPaymentLabel(key: string): string {
    return PAYMENT_LABELS[key] ?? key
}

export function PaymentSection({control, paymentMethods}: PaymentSectionProps) {
    if (paymentMethods.length === 0) {
        return (
            <CheckoutSection id="payment" title="Payment method">
                <p className="text-sm text-(--sf-muted-text)">
                    No payment methods are configured. Please contact us.
                </p>
            </CheckoutSection>
        )
    }

    return (
        <CheckoutSection id="payment" title="Payment method">

            {paymentMethods.length === 1 ? (
                // Selected for the shopper by the page; shown in the same panel
                // treatment as the choices, so a single option does not read as
                // an afterthought.
                <div className="rounded-lg border border-(--sf-accent) bg-(--sf-surface-muted) p-3">
                    <p className="text-sm font-medium text-(--sf-text)">
                        {getPaymentLabel(paymentMethods[0])}
                    </p>
                    {PAYMENT_HINTS[paymentMethods[0]] && (
                        <p className="mt-1 text-xs text-(--sf-muted-text)">
                            {PAYMENT_HINTS[paymentMethods[0]]}
                        </p>
                    )}
                </div>
            ) : (
                <Controller
                    name="paymentMethod"
                    control={control}
                    render={({field, fieldState}) => (
                        <fieldset>
                            <legend className="sr-only">Select a payment method</legend>
                            <div className="space-y-2">
                                {paymentMethods.map((method) => (
                                    <label
                                        key={method}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                            field.value === method ? 'border-(--sf-accent) bg-(--sf-surface-muted)' : 'border-(--sf-border) hover:border-(--sf-accent)'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            value={method}
                                            checked={field.value === method}
                                            onChange={() => field.onChange(method)}
                                            className="mt-0.5 h-4 w-4 accent-(--sf-accent)"
                                        />
                                        <span>
                                            <span className="block text-sm font-medium text-(--sf-text)">
                                                {getPaymentLabel(method)}
                                            </span>
                                            {PAYMENT_HINTS[method] && (
                                                <span className="mt-0.5 block text-xs text-(--sf-muted-text)">
                                                    {PAYMENT_HINTS[method]}
                                                </span>
                                            )}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {fieldState.error && (
                                <p className="mt-1 text-sm text-(--sf-error)">
                                    {fieldState.error.message}
                                </p>
                            )}
                        </fieldset>
                    )}
                />
            )}
        </CheckoutSection>
    )
}
