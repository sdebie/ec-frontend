import {useState} from 'react'
import {Calendar, Mail, Phone, User} from 'lucide-react'
import {ConfirmationDialog} from '@/shared/ui/components'
import {Button, Card} from '@/shared/ui/primitives'
import type {AdminCapability} from '@/shared/auth/adminPermissions'
import {useCan} from '@/shared/auth/adminPermissions'
import type {CustomerType} from '@/admin/pages/customers/types'
import {getAvailableActions} from '@/admin/pages/customers/types'
import {useUpdateCustomerStatus} from '../hooks/useUpdateCustomerStatus'
import type {WholesaleCustomerDetail} from '../types'
import {resolveCustomerStatusConfig} from './customerStatus'
import {STATUS_ACCENT_CLASS} from './applicationStatus.ts'
import {WholesaleApplicationDetailHeader} from './WholesaleApplicationDetailHeader.tsx'
import {formatDateTime} from '@/shared/utils/formatDateTime.ts'

interface CustomerIdentityPanelProps {
    customer: WholesaleCustomerDetail
    /** Shown as a small badge next to the name — only the retail Customer Detail page passes this. */
    shopperType?: CustomerType
    /**
     * Capability gating Suspend/Activate. Defaults to the wholesale capability
     * since that's this component's original page; the retail Customer Detail
     * page passes 'customer:write' so its own permission — not wholesale's —
     * governs a retail customer's account actions.
     */
    permissionCapability?: AdminCapability
}

/**
 * The customer's identity, contact details, and account status — self-contained
 * so the page doesn't need to know about the suspend dialogue or the status
 * mutation, mirroring ApplicantInformationPanel's shape on the sibling page.
 * Shared by the wholesale and retail Customer Detail pages.
 */
export function CustomerIdentityPanel({
                                          customer,
                                          shopperType,
                                          permissionCapability = 'wholesale-customer:write',
                                      }: CustomerIdentityPanelProps) {
    const canMutate = useCan(permissionCapability)
    const statusAction = useUpdateCustomerStatus()
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)

    const availableActions = canMutate ? getAvailableActions(customer.status) : []
    const statusConfig = resolveCustomerStatusConfig(customer.status)
    const StatusIcon = statusConfig.icon
    const statusAccentClass = STATUS_ACCENT_CLASS[statusConfig.color] ?? 'text-(--c-text)'

    const handleActivate = () => {
        statusAction.mutate({customerId: customer.id, status: 'ACTIVE'})
    }

    const handleConfirmSuspend = () => {
        statusAction.mutate(
            {customerId: customer.id, status: 'DISABLED'},
            {onSettled: () => setSuspendDialogOpen(false)},
        )
    }

    return (
        <>
            <Card as="section" elevation="none" padded={false}>
                <WholesaleApplicationDetailHeader
                    icon={User}
                    title="Customer Information"
                    action={
                        availableActions.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3" data-testid="account-action-buttons">
                                {availableActions.includes('activate') && (
                                    <Button
                                        variant="solid"
                                        size="md"
                                        onClick={handleActivate}
                                        disabled={statusAction.isPending}
                                    >
                                        Activate
                                    </Button>
                                )}
                                {availableActions.includes('suspend') && (
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => setSuspendDialogOpen(true)}
                                        disabled={statusAction.isPending}
                                    >
                                        Suspend
                                    </Button>
                                )}
                            </div>
                        )
                    }
                />
                <Card.Body className="p-5">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-start">
                        {/* Left — Customer identity */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-semibold text-(--c-text)">
                                    {customer.firstName} {customer.lastName}
                                </p>
                                {shopperType && (
                                    <span
                                        className="rounded-full border border-(--c-border) px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-(--c-text-muted)">
                                        {shopperType}
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 flex flex-col gap-1.5 text-sm text-(--c-text-muted)">
                                <span className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 shrink-0"/>
                                    <span>{customer.email}</span>
                                </span>
                                {customer.phone && (
                                    <span className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 shrink-0"/>
                                        <span>{customer.phone}</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 shrink-0"/>
                                    <span>Customer since {formatDateTime(customer.registeredAt)}</span>
                                </span>
                            </div>
                        </div>

                        {/* Right — Account Status */}
                        <div className="sm:self-start sm:border-l sm:border-(--c-border) sm:pl-6">
                            <div
                                className="flex flex-col gap-1.5 rounded-lg border border-(--c-border) bg-(--c-panel-secondary) p-4">
                                <p className="text-xs font-bold uppercase tracking-wide text-(--c-text-muted)">
                                    Account Status
                                </p>
                                <div className="flex items-center gap-2">
                                    <StatusIcon className={`h-5 w-5 ${statusAccentClass}`}/>
                                    <span className={`text-base font-semibold ${statusAccentClass}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>
                                <p className="text-sm text-(--c-text-muted)">{statusConfig.description}</p>
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

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
        </>
    )
}
