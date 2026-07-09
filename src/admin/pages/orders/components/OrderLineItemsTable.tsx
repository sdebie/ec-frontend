import { Thumbnail } from '@/shared/ui/components'
import { formatAmount } from '@/shared/utils/formatAmount'
import type { OrderLineItem } from '@/admin/hooks/orders'

interface OrderLineItemsTableProps {
  lineItems: OrderLineItem[]
}

export function OrderLineItemsTable({ lineItems }: OrderLineItemsTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-(--c-border)">
      <table className="w-full text-sm text-left text-(--c-text)">
        <thead className="text-xs font-semibold text-(--c-text-muted) bg-(--c-surface-hover) border-b border-(--c-border)">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3 text-right">Unit Price</th>
            <th className="px-4 py-3 text-right">Qty</th>
            <th className="px-4 py-3 text-right">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--c-border)">
          {lineItems.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Thumbnail
                    logoUrl={item.thumbnailUrl}
                    name={item.productName}
                    size="sm"
                  />
                  <span className="font-medium">{item.productName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-(--c-text-muted)">{item.variantSku}</td>
              <td className="px-4 py-3 text-right">{formatAmount(item.unitPrice)}</td>
              <td className="px-4 py-3 text-right">{item.quantity}</td>
              <td className="px-4 py-3 text-right font-medium">
                {formatAmount(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
