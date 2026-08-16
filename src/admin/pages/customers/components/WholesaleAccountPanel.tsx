import {useState} from 'react'
import {Building2, Calendar} from 'lucide-react'
import {StatusBadge} from '@/shared/ui/components'
import {Button, Card} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {RejectApplicationDialog} from '@/admin/components/RejectApplicationDialog'
import {useWholesaleApplicationAction} from '../hooks/useWholesaleApplicationAction'
import type {WholesaleCustomerDetail} from '../types'
import {InfoRow} from './InfoRow'
import {resolveApplicationStatusConfig} from './applicationStatus.ts'
import {WholesaleApplicationDetailHeader} from './WholesaleApplicationDetailHeader.tsx'
import {formatDateTime} from '@/shared/utils/formatDateTime.ts'

const EMPTY_VALUE = '—'

interface WholesaleAccountPanelProps {
    customer: WholesaleCustomerDetail
}

/**
 * The customer's wholesale account: company + finance details, plus the
 * approval/reject decision while the application is still PENDING —
 * self-contained so the page doesn't need to know about the reject dialog
 * or the decision mutation, mirroring ApplicantInformationPanel's shape.
 */
export function WholesaleAccountPanel({customer}: WholesaleAccountPanelProps) {
    const canDecide = useCan('wholesale-application:decide')
    const applicationAction = useWholesaleApplicationAction()
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

    const application = customer.wholesaleApplication

    if (!application) {
        return (
            <Card as="section" elevation="none" padded={false}>
                <WholesaleApplicationDetailHeader icon={Building2} title="Wholesale Account"/>
                <Card.Body className="p-5">
                    <p className="text-sm text-(--c-text-muted)">
                        No wholesale application exists for this customer.
                    </p>
                </Card.Body>
            </Card>
        )
    }

    const isPending = application.status === 'PENDING'
    const canDecideNow = isPending && canDecide

    const handleApprove = () => {
        applicationAction.mutate({applicationId: application.id, action: 'approve'})
    }

    const handleConfirmReject = (reason: string) => {
        applicationAction.mutate(
            {applicationId: application.id, customerId: customer.id, action: 'reject', reason},
            {onSettled: () => setRejectDialogOpen(false)},
        )
    }

    return (
        <>
            <Card as="section" elevation="none" padded={false}>
                <WholesaleApplicationDetailHeader
                    icon={Building2}
                    title="Wholesale Account"
                    action={
                        canDecideNow ? (
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRejectDialogOpen(true)}
                                    disabled={applicationAction.isPending}
                                    className="border-(--c-status-red-border) text-(--c-status-red-text) hover:border-(--c-status-red-text) hover:bg-(--c-status-red-bg) hover:text-(--c-status-red-text)"
                                >
                                    Reject
                                </Button>
                                <Button
                                    variant="solid"
                                    size="sm"
                                    onClick={handleApprove}
                                    disabled={applicationAction.isPending}
                                >
                                    Approve
                                </Button>
                            </div>
                        ) : (
                            <StatusBadge
                                label={resolveApplicationStatusConfig(application.status).label}
                                color={resolveApplicationStatusConfig(application.status).color}
                            />
                        )
                    }
                />
                <Card.Body className="p-5">
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:items-start">
                        {/* Left — Company Details */}
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--c-text-muted)">
                                Company Details
                            </p>
                            <InfoRow label="Company Name" value={application.companyName}/>
                            <InfoRow label="Trading Name" value={application.tradingName || EMPTY_VALUE}/>
                            <InfoRow label="Applicant Email" value={application.applicantEmail}/>
                            <InfoRow label="Account Email" value={application.accountEmail || EMPTY_VALUE}/>
                            <InfoRow label="Company Phone" value={application.companyPhone || EMPTY_VALUE}/>
                            <InfoRow label="Company Email" value={application.companyEmail || EMPTY_VALUE}/>
                        </div>

                        {/* Right — Finance & Purchasing */}
                        <div className="flex flex-col gap-5 sm:border-l sm:border-(--c-border) sm:pl-8">
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--c-text-muted)">
                                    Finance Contact
                                </p>
                                <InfoRow label="Name" value={application.financeContactName || EMPTY_VALUE}/>
                                <InfoRow label="Email" value={application.financeContactEmail || EMPTY_VALUE}/>
                                <InfoRow label="Phone" value={application.financeContactPhone || EMPTY_VALUE}/>
                            </div>
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-(--c-text-muted)">
                                    Purchasing
                                </p>
                                <InfoRow
                                    label="Purchase Order Required"
                                    value={
                                        <StatusBadge
                                            label={application.purchaseOrderRequired ? 'Yes' : 'No'}
                                            color={application.purchaseOrderRequired ? 'green' : 'gray'}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className="mt-5 flex items-center gap-2 border-t border-(--c-border) pt-4 text-sm text-(--c-text-muted)">
                        <Calendar className="h-4 w-4 shrink-0"/>
                        <span>Application submitted {formatDateTime(application.submittedAt)}</span>
                    </div>
                </Card.Body>
            </Card>

            <RejectApplicationDialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                onConfirm={handleConfirmReject}
                isLoading={applicationAction.isPending}
            />
        </>
    )
}
