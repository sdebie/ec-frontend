import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import {
  PageLoadingSpinner,
  StatusBadge,
  ConfirmationDialog,
} from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { formatAmount } from '@/shared/utils/formatAmount'
import {
  useWholesaleCustomerDetail,
  useWholesaleApplicationAction,
  useWholesaleCustomerStatusAction,
} from '@/admin/hooks/wholesale'
import {
  getAvailableActions,
  getCustomerStatusColor,
  getWholesaleStatusColor,
} from '@/admin/hooks/customers/types'

function formatTimestamp(dateString: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function WholesaleCustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const { data, isLoading } = useWholesaleCustomerDetail(customerId!)
  const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'
  const statusAction = useWholesaleCustomerStatusAction()
  const applicationAction = useWholesaleApplicationAction()

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  // 404 guard
  if (!isLoading && !data) {
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
            Customer not found
          </p>
          <Link
            to="/admin/wholesale/customers"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--c-accent, #2563eb)',
              color: 'var(--c-accent-text, #ffffff)',
            }}
          >
            Back to wholesale customers
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return <PageLoadingSpinner />
  }

  // At this point data is defined
  const customer = data!

  const availableActions = getAvailableActions(customer.status)

  const handleActivate = () => {
    statusAction.mutate({ customerId: customer.id, status: 'ACTIVE' })
  }

  const handleSuspend = () => {
    setSuspendDialogOpen(true)
  }

  const handleConfirmSuspend = () => {
    statusAction.mutate(
      { customerId: customer.id, status: 'DISABLED' },
      { onSettled: () => setSuspendDialogOpen(false) },
    )
  }

  const handleApprove = () => {
    if (!customer.wholesaleApplication) return
    applicationAction.mutate({
      applicationId: customer.wholesaleApplication.id,
      customerId: customer.id,
      action: 'approve',
    })
  }

  const handleReject = () => {
    setRejectDialogOpen(true)
  }

  const handleConfirmReject = () => {
    if (!customer.wholesaleApplication) return
    applicationAction.mutate(
      {
        applicationId: customer.wholesaleApplication.id,
        customerId: customer.id,
        action: 'reject',
      },
      { onSettled: () => setRejectDialogOpen(false) },
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Profile header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-semibold text-(--c-text)">
            {customer.firstName} {customer.lastName}
          </h1>
          <StatusBadge
            label={customer.status}
            color={getCustomerStatusColor(customer.status)}
          />
        </div>
        <div className="flex flex-col gap-1 text-sm text-(--c-text-muted)">
          <p>{customer.email}</p>
          {customer.phone && <p>{customer.phone}</p>}
          <p>Registered: {formatTimestamp(customer.registeredAt)}</p>
        </div>
      </div>

      {/* Account action buttons (SUPER_ADMIN only) */}
      {canMutate && availableActions.length > 0 && (
        <div className="flex flex-wrap gap-3" data-testid="account-action-buttons">
          {availableActions.includes('activate') && (
            <Button
              variant="solid"
              size="sm"
              onClick={handleActivate}
              disabled={statusAction.isPending}
            >
              Activate
            </Button>
          )}
          {availableActions.includes('suspend') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSuspend}
              disabled={statusAction.isPending}
            >
              Suspend
            </Button>
          )}
        </div>
      )}

      {/* Wholesale application card */}
      {customer.wholesaleApplication !== null ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-(--c-text)">
            Wholesale Application
          </h2>
          <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                  label={customer.wholesaleApplication.status}
                  color={getWholesaleStatusColor(
                    customer.wholesaleApplication.status,
                  )}
                />
              </div>
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Company Name:</span>{' '}
                {customer.wholesaleApplication.companyName}
              </p>
              {customer.wholesaleApplication.vatNumber && (
                <p className="text-sm text-(--c-text)">
                  <span className="font-medium">VAT Number:</span>{' '}
                  {customer.wholesaleApplication.vatNumber}
                </p>
              )}
              {customer.wholesaleApplication.regNumber && (
                <p className="text-sm text-(--c-text)">
                  <span className="font-medium">Registration Number:</span>{' '}
                  {customer.wholesaleApplication.regNumber}
                </p>
              )}
              <p className="text-sm text-(--c-text-muted)">
                Submitted: {formatTimestamp(customer.wholesaleApplication.submittedAt)}
              </p>
              {canMutate &&
                customer.wholesaleApplication.status === 'PENDING' && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={handleApprove}
                      disabled={applicationAction.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReject}
                      disabled={applicationAction.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-(--c-text)">
            Wholesale Application
          </h2>
          <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
            <p className="text-sm text-(--c-text-muted)">
              No wholesale application exists for this customer.
            </p>
          </div>
        </section>
      )}

      {/* Recent orders table */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-(--c-text)">Recent Orders</h2>
        {customer.recentOrders.length === 0 ? (
          <p className="text-sm text-(--c-text-muted)">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-(--c-border) bg-(--c-panel)">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--c-border)">
                  <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {customer.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-(--c-border) last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-medium text-(--c-accent) hover:underline"
                      >
                        {order.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-(--c-text-muted)">
                      {formatDate(order.placedAt)}
                    </td>
                    <td className="px-4 py-3 text-(--c-text)">
                      {formatAmount(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={order.status} color="gray" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Suspend Confirmation Dialog */}
      <ConfirmationDialog
        open={suspendDialogOpen}
        onClose={() => setSuspendDialogOpen(false)}
        onConfirm={handleConfirmSuspend}
        title="Suspend Customer"
        description="Are you sure you want to suspend this customer? They will no longer be able to access the storefront."
        variant="danger"
        confirmLabel="Suspend"
        isLoading={statusAction.isPending}
      />

      {/* Reject Wholesale Application Confirmation Dialog */}
      <ConfirmationDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        title="Reject Wholesale Application"
        description="Are you sure you want to reject this wholesale application?"
        variant="danger"
        confirmLabel="Reject"
        isLoading={applicationAction.isPending}
      />
    </div>
  )
}
