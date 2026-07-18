import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import {
  PageLoadingSpinner,
  StatusBadge,
  ConfirmationDialog,
} from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import {
  useWholesaleCustomerDetail,
  useWholesaleApplicationAction,
  useWholesaleCustomerStatusAction,
} from '@/admin/hooks/wholesale'
import { RecentOrdersTable } from '@/admin/components/RecentOrdersTable'
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
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Trading Name:</span>{' '}
                {customer.wholesaleApplication.tradingName || '-'}
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
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Applicant Email:</span>{' '}
                {customer.wholesaleApplication.applicantEmail}
              </p>
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Account Email:</span>{' '}
                {customer.wholesaleApplication.accountEmail || '-'}
              </p>
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Company Phone:</span>{' '}
                {customer.wholesaleApplication.companyPhone || '-'}
              </p>
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Company Email:</span>{' '}
                {customer.wholesaleApplication.companyEmail || '-'}
              </p>

              {/* Finance Contact */}
              <div className="border-t border-(--c-border) pt-3 mt-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--c-text-muted) mb-2">
                  Finance Contact
                </p>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-(--c-text)">
                    <span className="font-medium">Name:</span>{' '}
                    {customer.wholesaleApplication.financeContactName || '-'}
                  </p>
                  <p className="text-sm text-(--c-text)">
                    <span className="font-medium">Email:</span>{' '}
                    {customer.wholesaleApplication.financeContactEmail || '-'}
                  </p>
                  <p className="text-sm text-(--c-text)">
                    <span className="font-medium">Phone:</span>{' '}
                    {customer.wholesaleApplication.financeContactPhone || '-'}
                  </p>
                </div>
              </div>

              {/* Purchase Order Required */}
              <p className="text-sm text-(--c-text)">
                <span className="font-medium">Purchase Order Required:</span>{' '}
                {customer.wholesaleApplication.purchaseOrderRequired ? 'Yes' : 'No'}
              </p>

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
      <RecentOrdersTable orders={customer.recentOrders} title="Recent Orders" />

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
