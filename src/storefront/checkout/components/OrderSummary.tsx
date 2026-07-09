import { useCheckoutSessionStore } from '../checkoutSessionStore'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { formatAmount } from '@/shared/utils/formatAmount'

export function OrderSummary() {
  const session = useCheckoutSessionStore((state) => state.session)
  const { currency, locale } = useStorefrontConfig()

  if (!session) {
    return null
  }

  return (
    <section aria-labelledby="order-summary-heading" className="rounded-lg border border-gray-200 p-6">
      <h2 id="order-summary-heading" className="text-lg font-semibold mb-4">
        Order summary
      </h2>

      <ul className="divide-y divide-gray-100" role="list">
        {session.lines.map((line) => (
          <li key={line.variantId} className="flex justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{line.name}</p>
              <p className="text-sm text-gray-500">
                {line.quantity} × {formatAmount(line.unitPrice, currency, locale)}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {formatAmount(line.lineTotal, currency, locale)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Subtotal</dt>
          <dd className="font-medium text-gray-900">
            {formatAmount(session.subtotal, currency, locale)}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-gray-500">VAT</dt>
          <dd className="font-medium text-gray-900">
            {formatAmount(session.vatAmount, currency, locale)}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-gray-500">Shipping</dt>
          <dd className="font-medium text-gray-900">
            {formatAmount(session.shippingEstimate, currency, locale)}
          </dd>
        </div>

        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatAmount(session.grandTotal, currency, locale)}</dd>
        </div>
      </dl>
    </section>
  )
}
