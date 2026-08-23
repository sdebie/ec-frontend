import { useParams, Link } from 'react-router-dom'

import { PageLoadingSpinner, StatusBadge } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import {
  useQuoteRequestDetail,
  useQuoteRequestStatusAction,
} from '@/admin/hooks/quotes'
import { QuoteRequestStatusOptions } from '@/shared/types/enums'
import type { QuoteRequestStatus } from '@/shared/types/enums'
import { useCan } from '@/shared/auth/adminPermissions'
import { formatDateTime } from '@/shared/utils/formatDateTime'

function getStatusColor(status: QuoteRequestStatus): string {
  return QuoteRequestStatusOptions[status]?.color ?? 'blue'
}

function getStatusLabel(status: QuoteRequestStatus): string {
  return QuoteRequestStatusOptions[status]?.label ?? status
}

export function QuoteRequestDetailPage() {
  const { quoteRequestId } = useParams<{ quoteRequestId: string }>()
  const { data, isLoading, isError } = useQuoteRequestDetail(quoteRequestId!)
  const statusAction = useQuoteRequestStatusAction()

  const canMutate = useCan('quote:write')

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div
          className="w-full max-w-md rounded-xl p-8 text-center"
          style={{
            background: 'var(--c-panel, #ffffff)',
            border: '1px solid var(--c-border, #e5e7eb)',
            boxShadow: 'var(--c-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
          }}
        >
          <h2
            className="mb-2 text-xl font-semibold"
            style={{ color: 'var(--c-text, #111827)' }}
          >
            Error
          </h2>
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: 'var(--c-text-muted, #6b7280)' }}
          >
            Failed to load quote request details.
          </p>
          <Link
            to="/admin/quotes"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--c-accent, #2563eb)',
              color: 'var(--c-accent-text, #ffffff)',
            }}
          >
            Back to Quote Requests
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div
          className="w-full max-w-md rounded-xl p-8 text-center"
          style={{
            background: 'var(--c-panel, #ffffff)',
            border: '1px solid var(--c-border, #e5e7eb)',
            boxShadow: 'var(--c-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
          }}
        >
          <h2
            className="mb-2 text-xl font-semibold"
            style={{ color: 'var(--c-text, #111827)' }}
          >
            Not Found
          </h2>
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: 'var(--c-text-muted, #6b7280)' }}
          >
            Quote request not found.
          </p>
          <Link
            to="/admin/quotes"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--c-accent, #2563eb)',
              color: 'var(--c-accent-text, #ffffff)',
            }}
          >
            Back to Quote Requests
          </Link>
        </div>
      </div>
    )
  }

  const quoteRequest = data

  const handleStatusChange = (newStatus: QuoteRequestStatus) => {
    statusAction.mutate({ id: quoteRequestId!, status: newStatus })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Back navigation */}
      <Link
        to="/admin/quotes"
        className="inline-flex items-center gap-1 text-sm text-(--c-text-muted) hover:text-(--c-text) transition-colors"
      >
        &larr; Back to Quote Requests
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-semibold text-(--c-text)">
            Quote Request from {quoteRequest.name}
          </h1>
          <StatusBadge
            label={getStatusLabel(quoteRequest.status)}
            color={getStatusColor(quoteRequest.status)}
          />
        </div>
        <p className="text-sm text-(--c-text-muted)">
          Submitted: {formatDateTime(quoteRequest.createdAt)}
          {quoteRequest.statusChangedAt && (
            <> &middot; Last updated: {formatDateTime(quoteRequest.statusChangedAt)}</>
          )}
        </p>
      </div>

      {/* Status Actions — only visible for SUPER_ADMIN and ORDER_MANAGER */}
      {canMutate && quoteRequest.status !== 'CLOSED' && (
        <div className="flex flex-wrap gap-3" data-testid="status-actions">
          {quoteRequest.status === 'NEW' && (
            <>
              <Button
                variant="solid"
                size="sm"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={statusAction.isPending}
              >
                Start Processing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('CLOSED')}
                disabled={statusAction.isPending}
              >
                Close
              </Button>
            </>
          )}
          {quoteRequest.status === 'IN_PROGRESS' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('CLOSED')}
              disabled={statusAction.isPending}
            >
              Close
            </Button>
          )}
        </div>
      )}

      {/* Contact Information */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-(--c-text)">Contact Information</h2>
        <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-(--c-text)">
              <span className="font-medium">Name:</span> {quoteRequest.name}
            </p>
            <p className="text-sm text-(--c-text)">
              <span className="font-medium">Email:</span> {quoteRequest.email}
            </p>
            {quoteRequest.phone && (
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Phone:</span> {quoteRequest.phone}
              </p>
            )}
            {quoteRequest.company && (
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Company:</span> {quoteRequest.company}
              </p>
            )}
          </div>
        </div>
      </section>

      {quoteRequest.message && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-(--c-text)">Message</h2>
          <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
            <p className="text-sm text-(--c-text) whitespace-pre-wrap">
              {quoteRequest.message}
            </p>
          </div>
        </section>
      )}

      {/* Line Items */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-(--c-text)">
          Requested Items ({quoteRequest.items.length})
        </h2>
        <div className="rounded-lg border border-(--c-border) bg-(--c-panel) overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--c-border) bg-(--c-surface)">
                <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                  Variant / SKU
                </th>
                <th className="px-4 py-3 text-right font-medium text-(--c-text-muted)">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {quoteRequest.items.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-(--c-border) last:border-b-0"
                >
                  <td className="px-4 py-3 text-(--c-text)">
                    {item.productNameSnapshot}
                    {item.variantId === null && (
                      <span className="ml-2 text-xs text-(--c-text-muted) italic">
                        (variant removed)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-(--c-text)">
                    {item.variantSkuSnapshot || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-(--c-text)">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
