import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { CheckoutFormValues } from '../checkoutFormSchema'

interface PaymentSectionProps {
  control: Control<CheckoutFormValues>
  paymentMethods: string[]
}

const PAYMENT_LABELS: Record<string, string> = {
  PAYFAST: 'Pay online (PayFast)',
  IN_STORE: 'Pay in store at collection',
}

function getPaymentLabel(key: string): string {
  return PAYMENT_LABELS[key] ?? key
}

export function PaymentSection({ control, paymentMethods }: PaymentSectionProps) {
  const { setValue } = useFormContext<CheckoutFormValues>()

  useEffect(() => {
    if (paymentMethods.length === 1) {
      setValue('paymentMethod', paymentMethods[0])
    }
  }, [paymentMethods, setValue])

  if (paymentMethods.length === 0) {
    return (
      <section aria-labelledby="payment-heading">
        <h2 id="payment-heading" className="text-lg font-semibold mb-4">
          Payment method
        </h2>
        <p className="text-sm text-(--sf-muted-text)">
          No payment methods are configured. Please contact us.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="payment-heading">
      <h2 id="payment-heading" className="text-lg font-semibold mb-4">
        Payment method
      </h2>

      {paymentMethods.length === 1 ? (
        <p className="text-sm text-(--sf-text)">
          {getPaymentLabel(paymentMethods[0])}
        </p>
      ) : (
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field, fieldState }) => (
            <fieldset>
              <legend className="sr-only">Select a payment method</legend>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 rounded-md border border-(--sf-border) p-3 cursor-pointer hover:border-(--sf-accent) has-[:checked]:border-(--sf-accent)"
                  >
                    <input
                      type="radio"
                      value={method}
                      checked={field.value === method}
                      onChange={() => field.onChange(method)}
                      className="accent-(--sf-accent)"
                    />
                    <span className="text-sm">{getPaymentLabel(method)}</span>
                  </label>
                ))}
              </div>
              {fieldState.error && (
                <p className="mt-1 text-sm text-(--c-error)">
                  {fieldState.error.message}
                </p>
              )}
            </fieldset>
          )}
        />
      )}
    </section>
  )
}
