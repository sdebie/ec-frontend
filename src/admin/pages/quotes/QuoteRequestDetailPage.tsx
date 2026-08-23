import {Link, useNavigate, useParams} from 'react-router-dom'

import {FormPageNotFound, PageLayout, PageLoadingSpinner, StatusBadge} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {useQuoteRequestDetail} from './hooks/useQuoteRequestDetail'
import {useQuoteRequestStatusAction} from './hooks/useQuoteRequestStatusAction'
import {QuoteContactPanel} from './components/QuoteContactPanel'
import {QuoteSummaryCard} from './components/QuoteSummaryCard'
import {QuoteActionsCard} from './components/QuoteActionsCard'
import {QuoteMessagePanel} from './components/QuoteMessagePanel'
import {QuoteLineItemsTable} from './components/QuoteLineItemsTable'
import type {QuoteRequestStatus} from '@/shared/types/enums'
import {useCan} from '@/shared/auth/adminPermissions'
import {getQuoteStatusColor, getQuoteStatusLabel} from './utils/quoteStatusDisplay'

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
        return (
            <FormPageNotFound
                entityName="Quote request"
                backHref="/admin/quotes"
                backLabel="Back to Quote Requests"
            />
        )
    }

    const quoteRequest = data

    const handleStatusChange = (newStatus: QuoteRequestStatus) => {
        statusAction.mutate({id: quoteRequestId!, status: newStatus})
    }

    const totalQuantity = quoteRequest.items.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <PageLayout
            title="Quote Detail"
            onBack={() => navigate(-1)}
            backLabel="Back to Quote Requests"
            action={
                <StatusBadge
                    label={getQuoteStatusLabel(quoteRequest.status)}
                    color={getQuoteStatusColor(quoteRequest.status)}
                />
            }
        >
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <QuoteContactPanel name={quoteRequest.name} email={quoteRequest.email}/>
                    <QuoteSummaryCard
                        id={quoteRequest.id}
                        createdAt={quoteRequest.createdAt}
                        statusChangedAt={quoteRequest.statusChangedAt}
                        itemCount={quoteRequest.items.length}
                        totalQuantity={totalQuantity}
                        status={quoteRequest.status}
                    />
                    <QuoteActionsCard
                        status={quoteRequest.status}
                        canMutate={canMutate}
                        onStatusChange={handleStatusChange}
                        isPending={statusAction.isPending}
                    />
                </div>

                {quoteRequest.message && (
                    <QuoteMessagePanel message={quoteRequest.message}/>
                )}

                <QuoteLineItemsTable items={quoteRequest.items}/>
            </div>
        </PageLayout>
    )
}
