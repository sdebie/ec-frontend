import {useEffect, useState} from 'react'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useImageList} from './hooks/useImageList'
import {useDeleteImage} from './hooks/useDeleteImage'
import {useCan} from '@/shared/auth/adminPermissions'
import {ConfirmationDialog, PageLayout, toast} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import {ImageToolbar, type ImageViewMode} from './components/ImageToolbar'
import {ImageGrid} from './components/ImageGrid'
import {ImageListTable} from './components/ImageListTable'
import {ImageBulkActionBar} from './components/ImageBulkActionBar'
import {ImagePreviewDialog} from './ImagePreviewDialog'
import {SingleUploadDialog} from './SingleUploadDialog'
import {BulkUploadDialog} from './BulkUploadDialog'

const PAGE_SIZE = 80

type DeleteTarget = { type: 'single'; filename: string } | { type: 'bulk'; filenames: string[] }

export function ImageGalleryPage() {
    const canMutate = useCan('image:write')

    const [view, setView] = useState<ImageViewMode>('grid')
    const [searchInput, setSearchInput] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const [previewFilename, setPreviewFilename] = useState<string | null>(null)
    const [uploadOpen, setUploadOpen] = useState(false)
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false)

    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

    const deleteImage = useDeleteImage()

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    const {data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = useImageList({
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        enabled: view === 'grid',
    })
    const images = data?.pages?.flatMap((result) => result.images) ?? []

    const handleLoadMore = () => {
        void fetchNextPage()
    }

    const handleViewChange = (next: ImageViewMode) => {
        setView(next)
        setSelectedRows(new Set())
    }

    const handleBulkDeleteRequest = () => {
        if (selectedRows.size === 0) return
        setDeleteTarget({type: 'bulk', filenames: Array.from(selectedRows)})
    }

    // No bulk-delete endpoint exists, so a multi-image delete fans out one mutation per
    // image and reports partial failure rather than hiding it — the same convention
    // ProductListPage's bulk status update uses for the identical "no bulk endpoint" shape.
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return

        if (deleteTarget.type === 'single') {
            deleteImage.mutate(deleteTarget.filename, {
                onSuccess: () => {
                    toast.success('Image deleted')
                    setDeleteTarget(null)
                },
                onError: (error) => {
                    toast.error(error instanceof Error ? error.message : 'Failed to delete image', {duration: 0})
                    setDeleteTarget(null)
                },
            })
            return
        }

        const filenames = deleteTarget.filenames
        const results = await Promise.allSettled(filenames.map((filename) => deleteImage.mutateAsync(filename)))
        const failedCount = results.filter((result) => result.status === 'rejected').length
        const succeededCount = results.length - failedCount

        if (failedCount === 0) {
            toast.success(`${succeededCount} ${succeededCount === 1 ? 'image' : 'images'} deleted`)
        } else if (succeededCount === 0) {
            toast.error(`${failedCount} of ${results.length} images could not be deleted — still in use`, {duration: 0})
        } else {
            toast.error(`${succeededCount} of ${results.length} images deleted — ${failedCount} still in use`, {duration: 0})
        }

        setSelectedRows(new Set())
        setDeleteTarget(null)
    }

    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Images'},
    ])

    const headerAction = canMutate && (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="md" onClick={() => setBulkUploadOpen(true)}>Bulk upload</Button>
            <Button variant="solid" size="md" onClick={() => setUploadOpen(true)}>Upload image</Button>
        </div>
    )

    return (
        <PageLayout title="Images" subtitle="Browse and manage store images" action={headerAction}>
            <div className="space-y-4">
                <ImageToolbar
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                    view={view}
                    onViewChange={handleViewChange}
                />

                {view === 'grid' && (
                    <ImageGrid
                        images={images}
                        isLoading={isLoading}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        onLoadMore={handleLoadMore}
                        onPreview={setPreviewFilename}
                    />
                )}

                {view === 'list' && (
                    <>
                        {selectedRows.size > 0 && (
                            <ImageBulkActionBar
                                selectedCount={selectedRows.size}
                                onDelete={handleBulkDeleteRequest}
                                onClear={() => setSelectedRows(new Set())}
                                isDeleting={deleteImage.isPending}
                            />
                        )}

                        <ImageListTable
                            search={debouncedSearch}
                            selectedRows={selectedRows}
                            onSelectedRowsChange={setSelectedRows}
                            canMutate={canMutate}
                            onPreview={setPreviewFilename}
                            onDeleteOne={(filename) => setDeleteTarget({type: 'single', filename})}
                        />
                    </>
                )}
            </div>

            <ImagePreviewDialog
                open={previewFilename !== null}
                onClose={() => setPreviewFilename(null)}
                filename={previewFilename}
            />

            <SingleUploadDialog
                open={uploadOpen}
                onClose={() => setUploadOpen(false)}
            />

            <BulkUploadDialog
                open={bulkUploadOpen}
                onClose={() => setBulkUploadOpen(false)}
            />

            <ConfirmationDialog
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title={deleteTarget?.type === 'bulk' ? `Delete ${deleteTarget.filenames.length} Images` : 'Delete Image'}
                description={
                    deleteTarget?.type === 'bulk'
                        ? `Delete ${deleteTarget.filenames.length} selected images? Any image still in use elsewhere is skipped and reported, not deleted.`
                        : `Delete "${deleteTarget?.type === 'single' ? deleteTarget.filename : ''}"? This cannot be undone. An image still in use elsewhere will be refused.`
                }
                variant="danger"
                confirmLabel="Delete"
                isLoading={deleteImage.isPending}
            />
        </PageLayout>
    )
}
