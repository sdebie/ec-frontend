import {useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'

import {ConfirmationDialog, FormPageNotFound, PageLayout, PageLoadingSpinner, StatusBadge} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {usePageContent} from '@/admin/hooks/pages/usePageContent'
import {useSavePageDraft} from '@/admin/hooks/pages/useSavePageDraft'
import {usePublishPage} from '@/admin/hooks/pages/usePublishPage'
import {RichTextEditor} from '@/admin/components/RichTextEditor'

export function LegalPageEditPage() {
    const {id} = useParams<{ id: string }>()
    const navigate = useNavigate()
    const {data, isLoading, isFetched} = usePageContent(id!)
    const canEdit = useCan('legal:write')

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
        {label: 'Home', href: '/admin'},
        {label: 'Legal', href: '/admin/storefront/legal'},
        {label: data?.title ?? 'Edit'},
    ])

    // Loading state
    if (isLoading || content === null) {
        return <PageLoadingSpinner/>
    }

    // Not found state — only after fetch completes
    if (isFetched && !data) {
        return <FormPageNotFound entityName="Page" backHref="/admin/storefront/legal" backLabel="Back to Legal Pages"/>
    }

    const page = data!

    const handleSave = () => {
        saveDraft.mutate({id: page.id, content})
    }

    const handlePublishClick = () => {
        setPublishDialogOpen(true)
    }

    const handleConfirmPublish = async () => {
        await saveDraft.mutateAsync({id: page.id, content, silent: true})
        publishPage.mutate(page.id, {
            onSuccess: () => {
                setPublishDialogOpen(false)
                navigate('/admin/storefront/legal')
            },
        })
    }

    return (
        <PageLayout
            title={page.title}
            onBack={() => navigate(-1)}
            action={
                <div className="flex items-center gap-3">
                    <StatusBadge
                        label={page.publishedAt ? 'Published' : 'Unpublished'}
                        color={page.publishedAt ? 'green' : 'gray'}
                    />

                    {canEdit && (
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
            }
        >
            <RichTextEditor
                value={content}
                onChange={setContent}
                disabled={!canEdit}
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
        </PageLayout>
    )
}
