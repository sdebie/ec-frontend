import {Link, useNavigate, useParams} from 'react-router-dom'

import {FormPageNotFound, PageLayout, PageLoadingSpinner, StatusBadge} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {useQuoteRequestDetail} from './hooks/useQuoteRequestDetail'
import {useQuoteRequestStatusAction} from './hooks/useQuoteRequestStatusAction'
import {QuoteContactPanel} from './components/QuoteContactPanel'
import {QuoteMessagePanel} from './components/QuoteMessagePanel'
import {QuoteLineItemsTable} from './components/QuoteLineItemsTable'
import {QuoteStatusActions} from './components/QuoteStatusActions'
import type {QuoteRequestStatus} from '@/shared/types/enums'
import {QuoteRequestStatusOptions} from '@/shared/types/enums'
import {useCan} from '@/shared/auth/adminPermissions'
import {formatDateTime} from '@/shared/utils/formatDateTime'

function getStatusColor(status: QuoteRequestStatus): string {
    return QuoteRequestStatusOptions[status]?.color ?? 'blue'
}

function getStatusLabel(status: QuoteRequestStatus): string {
    return QuoteRequestStatusOptions[status]?.label ?? status
}

export function QuoteRequestDetailPage() {
    const navigate = useNavigate()
    const {quoteRequestId} = useParams<{ quoteRequestId: string }>()
    const {data, isLoading, isError} = useQuoteRequestDetail(quoteRequestId!)
    const statusAction = useQuoteRequestStatusAction()

    const canMutate = useCan('quote:write')

    if (isLoading) {
        return <PageLoadingSpinner/>
    }

    if (isError) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-8">
                <Card variant="bordered" className="w-full max-w-md p-8 text-center">
                    <h2 className="mb-2 text-xl font-semibold text-(--c-text)">
                        Error
                    </h2>
                    <p className="mb-6 text-sm leading-relaxed text-(--c-text-muted)">
                        Failed to load quote request details.
                    </p>
                    <Link
                        to="/admin/quotes"
                        className="inline-block rounded-lg bg-(--c-accent) px-5 py-2.5 text-sm font-medium text-(--c-accent-text) transition-opacity hover:opacity-80"
                    >
                        Back to Quote Requests
                    </Link>
                </Card>
            </div>
        )
    }

    if (!data) {
        return <FormPageNotFound entityName="Quote request" backHref="/admin/quotes"
                                 backLabel="Back to Quote Requests"/>
    }

    const quoteRequest = data

    const handleStatusChange = (newStatus: QuoteRequestStatus) => {
        statusAction.mutate({id: quoteRequestId!, status: newStatus})
    }

    const subtitle = quoteRequest.statusChangedAt
        ? `Submitted: ${formatDateTime(quoteRequest.createdAt)} · Last updated: ${formatDateTime(quoteRequest.statusChangedAt)}`
        : `Submitted: ${formatDateTime(quoteRequest.createdAt)}`

    return (
        <PageLayout
            title={`Quote Request from ${quoteRequest.name}`}
            subtitle={subtitle}
            onBack={() => navigate(-1)}
            action={
                <StatusBadge
                    label={getStatusLabel(quoteRequest.status)}
                    color={getStatusColor(quoteRequest.status)}
                />
            }
        >
            <div className="flex flex-col gap-6">
                {/* Status Actions — only visible for SUPER_ADMIN and ORDER_MANAGER */}
                {canMutate && quoteRequest.status !== 'CLOSED' && (
                    <QuoteStatusActions
                        status={quoteRequest.status}
                        onStatusChange={handleStatusChange}
                        isPending={statusAction.isPending}
                    />
                )}

                <Card as="article" variant="panel">
                    <Card.Body className="flex flex-col gap-6 p-5">
                        <QuoteContactPanel
                            name={quoteRequest.name}
                            email={quoteRequest.email}
                            phone={quoteRequest.phone}
                            company={quoteRequest.company}
                        />

                        {quoteRequest.message && (
                            <QuoteMessagePanel message={quoteRequest.message}/>
                        )}

                        <QuoteLineItemsTable items={quoteRequest.items}/>
                    </Card.Body>
                </Card>
            </div>
        </PageLayout>
    )
}
