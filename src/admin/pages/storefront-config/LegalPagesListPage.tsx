import {Link} from 'react-router-dom'
import {Pencil} from 'lucide-react'

import {StatusBadge} from '@/shared/ui/components'
import {buttonVariants, Card} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {useLegalPages} from '@/admin/hooks/pages'
import {formatDate} from '@/shared/utils/formatDateTime'
import {cn} from '@/shared/utils/cn'

export function LegalPagesListPage() {
    const {data: pages, isLoading, error} = useLegalPages()
    const canEdit = useCan('legal:write')

    if (isLoading) {
        return <div className="p-8 text-sm text-(--c-text-muted)">Loading legal pages…</div>
    }

    if (error) {
        return <div className="p-8 text-sm text-(--c-status-red-text)">Failed to load legal pages. Please try
            again.</div>
    }

    return (
        <div className="space-y-6 p-8">
            <div>
                <h1 className="text-2xl font-semibold text-(--c-text)">Legal Pages</h1>
                <p className="mt-1 text-sm text-(--c-text-muted)">
                    Manage your legal policy pages — Terms &amp; Conditions, Privacy Policy, and Delivery &amp; Returns.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pages?.map((page) => (
                    <Card key={page.id} as="article" variant="bordered" className="flex flex-col justify-between">
                        <Card.Body className="p-5">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="text-base font-semibold text-(--c-text)">{page.title}</h2>
                                <StatusBadge
                                    label={page.publishedAt ? 'Published' : 'Unpublished'}
                                    color={page.publishedAt ? 'green' : 'gray'}
                                />
                            </div>

                            <p className="mt-2 text-sm text-(--c-text-muted)">
                                {page.publishedAt
                                    ? `Last published: ${formatDate(page.publishedAt)}`
                                    : 'Never published'}
                            </p>

                            {page.hasUnpublishedChanges && (
                                <p className="mt-1 text-xs font-medium text-(--c-status-yellow-text)">
                                    Unpublished changes
                                </p>
                            )}
                        </Card.Body>

                        <Card.Footer className="flex items-center justify-end px-5 pb-5">
                            <Link
                                to={`/admin/storefront/legal/${page.id}`}
                                className={cn(buttonVariants({variant: 'outline', size: 'sm'}), 'gap-1.5')}
                                aria-label={`${canEdit ? 'Edit' : 'View'} ${page.title}`}
                            >
                                <Pencil className="h-4 w-4"/>
                                {canEdit ? 'Edit' : 'View'}
                            </Link>
                        </Card.Footer>
                    </Card>
                ))}
            </div>
        </div>
    )
}
