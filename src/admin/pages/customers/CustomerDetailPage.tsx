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
  useCustomerDetail,
  useUpdateCustomerStatus,
} from '@/admin/hooks/customers'
import { useWholesaleApplicationAction } from '@/admin/hooks/wholesale'
import { RecentOrdersTable } from '@/admin/components/RecentOrdersTable'
import { RejectApplicationDialog } from '@/admin/components/RejectApplicationDialog'
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

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const { data, isLoading } = useCustomerDetail(customerId!)
  const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'
  const updateStatus = useUpdateCustomerStatus()
  const wholesaleAction = useWholesaleApplicationAction()

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
            to="/admin/customers"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--c-accent, #2563eb)',
              color: 'var(--c-accent-text, #ffffff)',
            }}
          >
            Back to customers
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
    updateStatus.mutate({ customerId: customer.id, status: 'ACTIVE' })
  }

  const handleSuspend = () => {
    setSuspendDialogOpen(true)
  }

  const handleConfirmSuspend = () => {
    updateStatus.mutate(
      { customerId: customer.id, status: 'DISABLED' },
      { onSettled: () => setSuspendDialogOpen(false) },
    )
  }

  const handleApproveWholesale = () => {
    if (!customer.wholesaleApplication) return
    wholesaleAction.mutate({
      applicationId: customer.wholesaleApplication.id,
      customerId: customer.id,
      action: 'approve',
    })
  }

  const handleRejectWholesale = () => {
    setRejectDialogOpen(true)
  }

  const handleConfirmRejectWholesale = (reason: string) => {
    if (!customer.wholesaleApplication) return
    wholesaleAction.mutate(
      {
        applicationId: customer.wholesaleApplication.id,
        customerId: customer.id,
        action: 'reject',
        reason,
      },
      { onSettled: () => setRejectDialogOpen(false) },
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top section */}
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
          <p>Type: {customer.shopperType}</p>
          <p>Registered: {formatTimestamp(customer.registeredAt)}</p>
        </div>
      </div>

      {/* Action buttons (SUPER_ADMIN only) */}
      {canMutate && availableActions.length > 0 && (
        <div className="flex flex-wrap gap-3" data-testid="customer-action-buttons">
          {availableActions.includes('activate') && (
            <Button variant="solid" size="sm" onClick={handleActivate}>
              Activate
            </Button>
          )}
          {availableActions.includes('suspend') && (
            <Button variant="outline" size="sm" onClick={handleSuspend}>
              Suspend
            </Button>
          )}
        </div>
      )}

      {/* Order history section */}
      <RecentOrdersTable orders={customer.recentOrders} title="Order History" />

      {/* Wholesale section */}
      {customer.wholesaleApplication !== null && (
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
                <span className="font-medium">Business Name:</span>{' '}
                {customer.wholesaleApplication.companyName}
              </p>
              {canMutate &&
                customer.wholesaleApplication.status === 'PENDING' && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="solid"
                      size="sm"
                      onClick={handleApproveWholesale}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRejectWholesale}
                    >
                      Reject
                    </Button>
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      {/* Suspend Confirmation Dialog */}
      <ConfirmationDialog
        open={suspendDialogOpen}
        onClose={() => setSuspendDialogOpen(false)}
        onConfirm={handleConfirmSuspend}
        title="Suspend Customer"
        description="Are you sure you want to suspend this customer? They will no longer be able to access the storefront."
        variant="danger"
        confirmLabel="Suspend"
        isLoading={updateStatus.isPending}
      />

      {/* Reject Wholesale Confirmation Dialog */}
      <RejectApplicationDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmRejectWholesale}
        isLoading={wholesaleAction.isPending}
      />
    </div>
  )
}
