import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {ConfirmationDialog, PageLoadingSpinner, StatusBadge,} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import {useWholesaleApplicationAction, useWholesaleApplicationDetail,} from './hooks'
import {useCan} from '@/shared/auth/adminPermissions'
import {RejectApplicationDialog} from '@/admin/components/RejectApplicationDialog'

function formatTimestamp(dateString: string): string {
    return new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString))
}

function getApplicationStatusColor(
    status: string,
): 'green' | 'yellow' | 'red' | 'blue' {
    switch (status) {
        case 'APPROVED':
            return 'green'
        case 'PENDING':
            return 'yellow'
        case 'REJECTED':
            return 'red'
        case 'CONVERTED':
            return 'blue'
        default:
            return 'yellow'
    }
}

export function WholesaleApplicationDetailPage() {
    const {applicationId} = useParams<{ applicationId: string }>()
    const {data, isLoading} = useWholesaleApplicationDetail(applicationId!)
    const applicationAction = useWholesaleApplicationAction()
    const hasAccess = useCan('wholesale-application:decide')

    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

    // Loading state
    if (isLoading) {
        return <PageLoadingSpinner/>
    }

    // Not found state
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
                        style={{color: 'var(--c-text, #111827)'}}
                    >
                        Not Found
                    </h2>
                    <p
                        className="mb-6 text-sm leading-relaxed"
                        style={{color: 'var(--c-text-muted, #6b7280)'}}
                    >
                        Application not found
                    </p>
                    <Link
                        to="/admin/wholesale"
                        className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                        style={{
                            background: 'var(--c-accent, #2563eb)',
                            color: 'var(--c-accent-text, #ffffff)',
                        }}
                    >
                        Back to wholesale applications
                    </Link>
                </div>
            </div>
        )
    }

    const application = data
    const isPending = application.status === 'PENDING'

    const handleApproveConfirm = () => {
        applicationAction.mutate(
            {applicationId: applicationId!, action: 'approve'},
            {onSettled: () => setApproveDialogOpen(false)},
        )
    }

    const handleRejectConfirm = (reason: string) => {
        applicationAction.mutate(
            {applicationId: applicationId!, action: 'reject', reason},
            {onSettled: () => setRejectDialogOpen(false)},
        )
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-2xl font-semibold text-(--c-text)">
                        {application.firstName} {application.lastName}
                    </h1>
                    <StatusBadge
                        label={application.status}
                        color={getApplicationStatusColor(application.status)}
                    />
                </div>
                <div className="flex flex-col gap-1 text-sm text-(--c-text-muted)">
                    <p>Applicant Email: {application.applicantEmail}</p>
                    {application.email && (
                        <p>Account Email: {application.email}</p>
                    )}
                    {application.phone && <p>Phone: {application.phone}</p>}
                    <p>Submitted: {formatTimestamp(application.createdAt)}</p>
                </div>
            </div>

            {/* Decision buttons (PENDING + mutating role only) or processed info */}
            {isPending ? (
                hasAccess && (
                    <div className="flex flex-wrap gap-3" data-testid="decision-actions">
                        <Button
                            variant="solid"
                            size="sm"
                            onClick={() => setApproveDialogOpen(true)}
                            disabled={applicationAction.isPending}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRejectDialogOpen(true)}
                            disabled={applicationAction.isPending}
                        >
                            Reject
                        </Button>
                    </div>
                )
            ) : (
                <div className="flex flex-col gap-1 text-sm text-(--c-text-muted)">
                    {application.processedAt && (
                        <p>Processed: {formatTimestamp(application.processedAt)}</p>
                    )}
                    {application.rejectionReason && (
                        <p className="text-(--c-text)">
                            <span className="font-medium">Rejection Reason:</span>{' '}
                            {application.rejectionReason}
                        </p>
                    )}
                </div>
            )}

            {/* Company Information */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-(--c-text)">
                    Company Information
                </h2>
                <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Company Name:</span>{' '}
                            {application.companyName}
                        </p>
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Trading Name:</span>{' '}
                            {application.tradingName || '-'}
                        </p>
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Company Phone:</span>{' '}
                            {application.companyPhone || '-'}
                        </p>
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Company Email:</span>{' '}
                            {application.companyEmail || '-'}
                        </p>
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Registration Number:</span>{' '}
                            {application.regNumber || '-'}
                        </p>
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">VAT Number:</span>{' '}
                            {application.vatNumber || '-'}
                        </p>
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Purchase Order Required:</span>{' '}
                            {application.purchaseOrderRequired ? 'Yes' : 'No'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Physical Address */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-(--c-text)">
                    Physical Address
                </h2>
                <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
                    <div className="flex flex-col gap-2 text-sm text-(--c-text)">
                        {application.physicalAddressLine1 && (
                            <p>{application.physicalAddressLine1}</p>
                        )}
                        {application.physicalAddressLine2 && (
                            <p>{application.physicalAddressLine2}</p>
                        )}
                        {application.physicalSuburb && (
                            <p>{application.physicalSuburb}</p>
                        )}
                        {(application.physicalCity || application.physicalProvince) && (
                            <p>
                                {[application.physicalCity, application.physicalProvince]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        )}
                        {application.physicalPostalCode && (
                            <p>{application.physicalPostalCode}</p>
                        )}
                        {!application.physicalAddressLine1 && (
                            <p className="text-(--c-text-muted)">No physical address provided</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Postal Address */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-(--c-text)">
                    Postal Address
                </h2>
                <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
                    <div className="flex flex-col gap-2 text-sm text-(--c-text)">
                        {application.postalAddressLine1 && (
                            <p>{application.postalAddressLine1}</p>
                        )}
                        {application.postalAddressLine2 && (
                            <p>{application.postalAddressLine2}</p>
                        )}
                        {application.postalSuburb && (
                            <p>{application.postalSuburb}</p>
                        )}
                        {(application.postalCity || application.postalProvince) && (
                            <p>
                                {[application.postalCity, application.postalProvince]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        )}
                        {application.postalPostalCode && (
                            <p>{application.postalPostalCode}</p>
                        )}
                        {!application.postalAddressLine1 && (
                            <p className="text-(--c-text-muted)">No postal address provided</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Finance Contact */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-(--c-text)">
                    Finance Contact
                </h2>
                <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Name:</span>{' '}
                            {application.financeContactName || '-'}
                        </p>
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Email:</span>{' '}
                            {application.financeContactEmail || '-'}
                        </p>
                        <p className="text-sm text-(--c-text)">
                            <span className="font-medium">Phone:</span>{' '}
                            {application.financeContactPhone || '-'}
                        </p>
                    </div>
                </div>
            </section>

            {application.notes && (
                <section className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold text-(--c-text)">Notes</h2>
                    <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
                        <p className="text-sm text-(--c-text) whitespace-pre-wrap">
                            {application.notes}
                        </p>
                    </div>
                </section>
            )}

            <ConfirmationDialog
                open={approveDialogOpen}
                onClose={() => setApproveDialogOpen(false)}
                onConfirm={handleApproveConfirm}
                title="Approve Wholesale Application"
                description="Are you sure you want to approve this application? The customer's account will be upgraded to wholesale pricing."
                confirmLabel="Approve"
                isLoading={applicationAction.isPending}
            />

            <RejectApplicationDialog
                open={rejectDialogOpen}
                onClose={() => setRejectDialogOpen(false)}
                onConfirm={handleRejectConfirm}
                isLoading={applicationAction.isPending}
            />
        </div>
    )
}
