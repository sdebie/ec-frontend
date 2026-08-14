import { Link } from 'react-router-dom'
import { Pencil } from 'lucide-react'

import { StatusBadge } from '@/shared/ui/components'
import { Card } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useLegalPages } from '@/admin/hooks/pages'

function formatPublishedDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function LegalPagesListPage() {
  const { data: pages, isLoading, error } = useLegalPages()
  const canEdit = useCan('legal:write')

  if (isLoading) {
    return <div className="p-8 text-sm text-(--c-text-muted)">Loading legal pages…</div>
  }

  if (error) {
    return <div className="p-8 text-sm text-(--c-status-red-text)">Failed to load legal pages. Please try again.</div>
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
          <Card key={page.id} as="article" className="flex flex-col justify-between">
            <Card.Body>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-(--c-text)">{page.title}</h2>
                <StatusBadge
                  label={page.publishedAt ? 'Published' : 'Unpublished'}
                  color={page.publishedAt ? 'green' : 'gray'}
                />
              </div>

              <p className="mt-2 text-sm text-(--c-text-muted)">
                {page.publishedAt
                  ? `Last published: ${formatPublishedDate(page.publishedAt)}`
                  : 'Never published'}
              </p>

              {page.hasUnpublishedChanges && (
                <p className="mt-1 text-xs font-medium text-(--c-status-yellow-text)">
                  Unpublished changes
                </p>
              )}
            </Card.Body>

            <Card.Footer className="flex items-center justify-end">
              <Link
                to={`/admin/storefront/legal/${page.id}`}
                className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium text-(--c-text) hover:bg-(--c-surface-hover)"
                aria-label={`Edit ${page.title}`}
              >
                <Pencil className="h-4 w-4" />
                {canEdit ? 'Edit' : 'View'}
              </Link>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  )
}
