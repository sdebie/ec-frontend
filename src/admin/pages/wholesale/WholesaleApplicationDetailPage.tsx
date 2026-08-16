import {type ReactNode, useState} from 'react'
import {useParams} from 'react-router-dom'
import {
    Building2,
    CalendarDays,
    Check,
    CircleCheck,
    CircleX,
    Clock,
    HandCoins,
    Mail,
    MapPinHouse,
    Phone,
    UserCheck,
    X,
} from 'lucide-react'
import {
    Alert,
    ConfirmationDialog,
    FormPageLayout,
    FormPageNotFound,
    PageLoadingSpinner,
    StatusBadge,
} from '@/shared/ui/components'
import {Button, Card} from '@/shared/ui/primitives'
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

/**
 * Single source of truth for how a status reads across the page: the header
 * badge and the status panel both key off this, so a status can't show one
 * color in one place and a different one in the other.
 */
const APPLICATION_STATUS_CONFIG: Record<
    string,
    { label: string; color: string; icon: typeof Clock; description: string }
> = {
    PENDING: {label: 'Pending', color: 'yellow', icon: Clock, description: 'Awaiting review and decision'},
    APPROVED: {label: 'Approved', color: 'green', icon: CircleCheck, description: 'This application has been approved'},
    REJECTED: {label: 'Rejected', color: 'red', icon: CircleX, description: 'This application has been rejected'},
    CONVERTED: {
        label: 'Converted',
        color: 'blue',
        icon: UserCheck,
        description: 'Applicant has been converted to a wholesale customer'
    },
}

// Mirrors StatusBadge's own color→token mapping, scoped to text/icon color only.
// Shared by the status panel's icon and its label, so they always agree.
const STATUS_ACCENT_CLASS: Record<string, string> = {
    yellow: 'text-(--c-status-yellow-text)',
    green: 'text-(--c-status-green-text)',
    red: 'text-(--c-status-red-text)',
    blue: 'text-(--c-status-yellow-text)',
}

function applicantInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/** A single label/value line in the "clean information row" pattern. */
function InfoRow({label, value}: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-sm text-(--c-text-muted)">{label}</span>
            <span className="text-right text-sm font-medium text-(--c-text)">{value}</span>
        </div>
    )
}

/** A card section header: an accent-coloured icon, a title, and an optional right-aligned slot. */
function SectionHeader({icon: Icon, title, action}: { icon?: typeof Building2; title: string; action?: ReactNode }) {
    return (
        <Card.Header className="m-0 flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-6 w-6 text-primary"/>}
                <span>{title}</span>
            </div>
            {action}
        </Card.Header>
    )
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
            <FormPageNotFound
                entityName="Application"
                backHref="/admin/wholesale"
                backLabel="Back to wholesale applications"
            />
        )
    }

    const application = data
    const isPending = application.status === 'PENDING'
    const statusConfig = APPLICATION_STATUS_CONFIG[application.status] ?? APPLICATION_STATUS_CONFIG.PENDING
    const StatusIcon = statusConfig.icon
    const canDecide = isPending && hasAccess
    const statusAccentClass = STATUS_ACCENT_CLASS[statusConfig.color] ?? 'text-(--c-text)'

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
        <FormPageLayout
            title="Application Details"
            action={<StatusBadge label={statusConfig.label} color={statusConfig.color}/>}
        >
            <div className="flex flex-col gap-6">
                <Alert
                    title="Review before proceeding"
                    description="Please verify all the information below before approving or rejecting this application."
                />

                <Card as="article" elevation="sm" padded={false}>
                    <Card.Body className="flex flex-col gap-6 p-5">
                        {/* Applicant Information */}
                        <Card as="section" elevation="none" padded={false}>
                            <SectionHeader
                                title="Applicant Information"
                                action={
                                    canDecide && (
                                        <div className="flex items-center gap-3" data-testid="decision-actions">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                leftIcon={<X className="h-4 w-4"/>}
                                                onClick={() => setRejectDialogOpen(true)}
                                                disabled={applicationAction.isPending}
                                                className="border-(--c-status-red-border) text-(--c-status-red-text) hover:border-(--c-status-red-text) hover:bg-(--c-status-red-bg) hover:text-(--c-status-red-text)"
                                            >
                                                Reject
                                            </Button>
                                            <Button
                                                variant="solid"
                                                size="sm"
                                                leftIcon={<Check className="h-4 w-4"/>}
                                                onClick={() => setApproveDialogOpen(true)}
                                                disabled={applicationAction.isPending}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    )
                                }
                            />
                            <Card.Body className="p-5">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[3fr_2fr]">
                                    {/* Left — Applicant */}
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-primary to-primary-subtle text-lg font-semibold text-(--c-accent-text)">
                                            {applicantInitials(application.firstName, application.lastName)}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-lg font-semibold text-(--c-text)">
                                                {application.firstName} {application.lastName}
                                            </p>
                                            <div className="flex flex-col gap-1.5 text-sm text-(--c-text-muted)">
                                                <span className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 shrink-0"/>
                                                    <span>{application.applicantEmail}</span>
                                                </span>
                                                {application.email && (
                                                    <span className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 shrink-0"/>
                                                        <span>{application.email}</span>
                                                        <span className="text-xs">(account)</span>
                                                    </span>
                                                )}
                                                {application.phone && (
                                                    <span className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 shrink-0"/>
                                                        <span>{application.phone}</span>
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 shrink-0"/>
                                                    <span>Submitted: {formatTimestamp(application.createdAt)}</span>
                                                </span>
                                            </div>

                                            {!isPending && (application.processedAt || application.rejectionReason) && (
                                                <div className="mt-1 flex flex-col gap-1 text-sm text-(--c-text-muted)">
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
                                        </div>
                                    </div>

                                    {/* Right — Application Status */}
                                    <div className="sm:border-l sm:border-(--c-border) sm:pl-6">
                                        <div
                                            className="flex h-full flex-col gap-1.5 rounded-lg border border-(--c-border) bg-(--c-panel-secondary) p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-(--c-text-muted)">
                                                Application Status
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

                        {/* Company Information */}
                        <Card as="section" elevation="none" padded={false}>
                            <SectionHeader icon={Building2} title="Company Information"/>
                            <Card.Body className="p-5">
                                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                                    <div>
                                        <InfoRow label="Company Name" value={application.companyName}/>
                                        <InfoRow label="Trading Name" value={application.tradingName || '-'}/>
                                        <InfoRow label="Company Phone" value={application.companyPhone || '-'}/>
                                        <InfoRow label="Company Email" value={application.companyEmail || '-'}/>
                                    </div>
                                    <div>
                                        <InfoRow label="Registration Number" value={application.regNumber || '-'}/>
                                        <InfoRow label="VAT Number" value={application.vatNumber || '-'}/>
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
                            </Card.Body>
                        </Card>

                        {/* Address Information */}
                        <Card as="section" elevation="none" padded={false}>
                            <SectionHeader icon={MapPinHouse} title="Address Information"/>
                            <Card.Body className="p-5">
                                <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-(--c-text-muted)">
                                            Physical Address
                                        </p>
                                        <div className="flex flex-col gap-1 text-sm text-(--c-text)">
                                            {application.physicalAddressLine1 &&
                                                <p>{application.physicalAddressLine1}</p>}
                                            {application.physicalAddressLine2 &&
                                                <p>{application.physicalAddressLine2}</p>}
                                            {application.physicalSuburb && <p>{application.physicalSuburb}</p>}
                                            {(application.physicalCity || application.physicalProvince) && (
                                                <p>
                                                    {[application.physicalCity, application.physicalProvince]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </p>
                                            )}
                                            {application.physicalPostalCode && <p>{application.physicalPostalCode}</p>}
                                            {!application.physicalAddressLine1 && (
                                                <p className="text-(--c-text-muted)">No physical address provided</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sm:border-l sm:border-(--c-border) sm:pl-6">
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-(--c-text-muted)">
                                            Postal Address
                                        </p>
                                        <div className="flex flex-col gap-1 text-sm text-(--c-text)">
                                            {application.postalAddressLine1 && <p>{application.postalAddressLine1}</p>}
                                            {application.postalAddressLine2 && <p>{application.postalAddressLine2}</p>}
                                            {application.postalSuburb && <p>{application.postalSuburb}</p>}
                                            {(application.postalCity || application.postalProvince) && (
                                                <p>
                                                    {[application.postalCity, application.postalProvince]
                                                        .filter(Boolean)
                                                        .join(', ')}
                                                </p>
                                            )}
                                            {application.postalPostalCode && <p>{application.postalPostalCode}</p>}
                                            {!application.postalAddressLine1 && (
                                                <p className="text-(--c-text-muted)">No postal address provided</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Financial Information */}
                        <Card as="section" elevation="none" padded={false}>
                            <SectionHeader icon={HandCoins} title="Financial Information"/>
                            <Card.Body className="p-5">
                                <InfoRow label="Contact Name" value={application.financeContactName || '-'}/>
                                <InfoRow label="Contact Email" value={application.financeContactEmail || '-'}/>
                                <InfoRow label="Contact Phone" value={application.financeContactPhone || '-'}/>
                            </Card.Body>
                        </Card>

                        {application.notes && (
                            <Card as="section" elevation="none" padded={false}>
                                <Card.Header className="m-0 px-5 py-4">Notes</Card.Header>
                                <Card.Body className="p-5">
                                    <p className="text-sm text-(--c-text) whitespace-pre-wrap">{application.notes}</p>
                                </Card.Body>
                            </Card>
                        )}
                    </Card.Body>
                </Card>

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
        </FormPageLayout>
    )
}
