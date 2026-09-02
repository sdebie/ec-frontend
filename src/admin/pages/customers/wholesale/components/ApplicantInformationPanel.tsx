import {useState} from 'react'
import {Calendar, FileUser, FileX, Mail, Phone} from 'lucide-react'
import {ConfirmationDialog, IconText} from '@/shared/ui/components'
import {Button, Card} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {RejectApplicationDialog} from '@/admin/components/RejectApplicationDialog'
import {useWholesaleApplicationAction} from '../../hooks/useWholesaleApplicationAction'
import type {WholesaleApplicationDetail} from '../hooks/useWholesaleApplicationDetail'
import {resolveApplicationStatusConfig, STATUS_ACCENT_CLASS} from '../../components/applicationStatus.ts'
import {WholesaleApplicationDetailHeader} from '../../components/WholesaleApplicationDetailHeader.tsx'
import {formatDateTime} from "@/shared/utils/formatDateTime.ts";

interface ApplicantInformationPanelProps {
    application: WholesaleApplicationDetail
}

/**
 * The applicant's identity, contact details, current status, and the
 * approval/reject decision itself — self-contained so the page doesn't need
 * to know about dialogue state or the decision mutation.
 */
export function ApplicantInformationPanel({application}: ApplicantInformationPanelProps) {

    const hasAccess = useCan('wholesale-application:decide')
    const applicationAction = useWholesaleApplicationAction()
    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

    const isPending = application.status === 'PENDING'
    const canDecide = isPending && hasAccess
    const statusConfig = resolveApplicationStatusConfig(application.status)
    const StatusIcon = statusConfig.icon
    const statusAccentClass = STATUS_ACCENT_CLASS[statusConfig.color] ?? 'text-(--c-text)'

    const handleApproveConfirm = () => {
        applicationAction.mutate(
            {applicationId: application.id, action: 'approve'},
            {onSettled: () => setApproveDialogOpen(false)},
        )
    }

    const handleRejectConfirm = (reason: string) => {
        applicationAction.mutate(
            {applicationId: application.id, action: 'reject', reason},
            {onSettled: () => setRejectDialogOpen(false)},
        )
    }

    return (
        <>
            <Card as="section" variant="bordered">
                <WholesaleApplicationDetailHeader
                    icon={FileUser}
                    title="Applicant Information"
                    action={
                        canDecide && (
                            <div className="flex items-center gap-3" data-testid="decision-actions">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setRejectDialogOpen(true)}
                                    disabled={applicationAction.isPending}
                                >
                                    Reject
                                </Button>
                                <Button
                                    variant="solid"
                                    size="lg"
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
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Left — Applicant */}
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-lg font-semibold text-(--c-text)">
                                    {application.firstName} {application.lastName}
                                </p>
                                <div className="flex flex-col gap-1.5 text-sm text-(--c-text-muted)">
                                    <IconText icon={<Mail className="h-4 w-4"/>}>
                                        <span>
                                            {application.applicantEmail}
                                        </span>
                                    </IconText>
                                    {application.email && (
                                        <IconText icon={<Mail className="h-4 w-4"/>}>
                                            <span>
                                                {application.email}
                                            </span>
                                            <span className="text-xs">
                                                (account)
                                            </span>
                                        </IconText>
                                    )}
                                    {application.phone && (
                                        <IconText icon={<Phone className="h-4 w-4"/>}>
                                            <span>
                                                {application.phone}
                                            </span>
                                        </IconText>
                                    )}
                                    <IconText icon={<Calendar className="h-4 w-4"/>}>
                                        <span>
                                            Submitted: {formatDateTime(application.createdAt)}
                                        </span>
                                    </IconText>
                                </div>

                                {!isPending && (application.processedAt || application.rejectionReason) && (
                                    <div className="mt-1 flex flex-col gap-1 text-sm text-(--c-text-muted)">
                                        {application.processedAt && (
                                            <IconText icon={<FileX className="h-4 w-4"/>}>
                                                Processed: {formatDateTime(application.processedAt)}
                                            </IconText>
                                        )}
                                        {application.rejectionReason && (
                                            <p className="text-(--c-text)">
                                                <span className="font-medium">
                                                    Rejection Reason:
                                                </span>
                                                {' '}
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
                                <IconText icon={<StatusIcon className={`h-5 w-5 ${statusAccentClass}`}/>} as="div">
                                    <span className={`text-base font-semibold ${statusAccentClass}`}>
                                        {statusConfig.label}
                                    </span>
                                </IconText>
                                <p className="text-sm text-(--c-text-muted)">
                                    {statusConfig.description}
                                </p>
                            </div>
                        </div>
                    </div>
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
        </>
    )
}
