import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

import { PageLoadingSpinner, ConfirmationDialog } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { usePageContent } from '@/admin/hooks/pages/usePageContent'
import { useSavePageDraft } from '@/admin/hooks/pages/useSavePageDraft'
import { usePublishPage } from '@/admin/hooks/pages/usePublishPage'
import { RichTextEditor } from '@/admin/components/RichTextEditor'

export function LegalPageEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isFetched } = usePageContent(id!)
  const role = useAdminAuthStore((s) => s.role)
  const isSuperAdmin = role === 'SUPER_ADMIN'

  const saveDraft = useSavePageDraft()
  const publishPage = usePublishPage()

  // Derive the initial editor content from the fetched data.
  // We track the initial value so the editor is only seeded once (on first data load).
  const initialContent = data ? (data.draftContent ?? data.publishedContent ?? '') : null
  const [content, setContent] = useState<string | null>(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  // Seed the local content state exactly once when data first arrives
  if (initialContent !== null && content === null) {
    setContent(initialContent)
  }

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Legal', href: '/admin/storefront/legal' },
    { label: data?.title ?? 'Edit' },
  ])

  // Loading state
  if (isLoading || content === null) {
    return <PageLoadingSpinner />
  }

  // Not found state — only after fetch completes
  if (isFetched && !data) {
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
            The page you are looking for does not exist.
          </p>
          <Link
            to="/admin/storefront/legal"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--c-accent, #2563eb)',
              color: 'var(--c-accent-text, #ffffff)',
            }}
          >
            Back to Legal Pages
          </Link>
        </div>
      </div>
    )
  }

  const page = data!

  const handleSave = () => {
    saveDraft.mutate({ id: page.id, content })
  }

  const handlePublishClick = () => {
    setPublishDialogOpen(true)
  }

  const handleConfirmPublish = async () => {
    await saveDraft.mutateAsync({ id: page.id, content, silent: true })
    publishPage.mutate(page.id, {
      onSuccess: () => {
        setPublishDialogOpen(false)
        navigate('/admin/storefront/legal')
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-(--c-text)">{page.title}</h1>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              page.publishedAt
                ? 'bg-(--c-status-green-bg) text-(--c-status-green-text)'
                : 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text)'
            }`}
          >
            {page.publishedAt ? 'Published' : 'Unpublished'}
          </span>
        </div>

        {isSuperAdmin && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              isLoading={saveDraft.isPending}
              disabled={saveDraft.isPending || publishPage.isPending}
            >
              Save Draft
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={handlePublishClick}
              disabled={saveDraft.isPending || publishPage.isPending}
            >
              Publish
            </Button>
          </div>
        )}
      </div>

      <RichTextEditor
        value={content}
        onChange={setContent}
        disabled={!isSuperAdmin}
      />

      <ConfirmationDialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        onConfirm={handleConfirmPublish}
        title="Publish Changes"
        description="Are you sure you want to publish these changes? This will make the content live on the storefront immediately."
        confirmLabel="Publish"
        isLoading={saveDraft.isPending || publishPage.isPending}
      />
    </div>
  )
}
