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
    <section aria-labelledby="order-summary-heading" className="rounded-lg border border-(--sf-border) p-6">
      <h2 id="order-summary-heading" className="text-lg font-semibold mb-4">
        Order summary
      </h2>

      <ul className="divide-y divide-(--sf-border)" role="list">
        {session.lines.map((line) => (
          <li key={line.variantId} className="flex justify-between py-3">
            <div>
              <p className="text-sm font-medium text-(--sf-text)">{line.name}</p>
              <p className="text-sm text-(--sf-muted-text)">
                {line.quantity} × {formatAmount(line.unitPrice, currency, locale)}
              </p>
            </div>
            <p className="text-sm font-medium text-(--sf-text)">
              {formatAmount(line.lineTotal, currency, locale)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-2 border-t border-(--sf-border) pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-(--sf-muted-text)">Subtotal</dt>
          <dd className="font-medium text-(--sf-text)">
            {formatAmount(session.subtotal, currency, locale)}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-(--sf-muted-text)">VAT</dt>
          <dd className="font-medium text-(--sf-text)">
            {formatAmount(session.vatAmount, currency, locale)}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-(--sf-muted-text)">Shipping</dt>
          <dd className="font-medium text-(--sf-text)">
            {formatAmount(session.shippingEstimate, currency, locale)}
          </dd>
        </div>

        <div className="flex justify-between border-t border-(--sf-border) pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatAmount(session.grandTotal, currency, locale)}</dd>
        </div>
      </dl>
    </section>
  )
}
