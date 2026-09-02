import {useEffect, useState} from 'react'
import type {PaginationState} from '@tanstack/react-table'
import {Eye, Trash2} from 'lucide-react'

import {useImageListPage} from '@/admin/hooks/images/useImageListPage'
import {thumbnailUrl} from '@/shared/utils/imageUrl'
import {type ColumnDef, DataTable, RowActionButton, Thumbnail} from '@/shared/ui/components'

const getRowId = (row: string) => row

const DEFAULT_PAGE_SIZE = 10

interface ImageListTableProps {
    search: string
    selectedRows: Set<string>
    onSelectedRowsChange: (next: Set<string>) => void
    canMutate: boolean
    onPreview: (filename: string) => void
    onDeleteOne: (filename: string) => void
}

export function ImageListTable({
                                   search,
                                   selectedRows,
                                   onSelectedRowsChange,
                                   canMutate,
                                   onPreview,
                                   onDeleteOne,
                               }: ImageListTableProps) {

    const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE})
    // A new search term invalidates the current page — start back at the first page
    // of the new result set rather than landing on a now-meaningless page index.
    useEffect(() => {
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }, [search])

    const {data, isLoading} = useImageListPage({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search,
    })
    const images = data?.images ?? []
    const pageCount = data ? Math.ceil(data.totalCount / pagination.pageSize) : 0

    const columns: ColumnDef<string, unknown>[] = [
        {
            id: 'thumbnail',
            header: '',
            cell: ({row}) => (
                <Thumbnail logoUrl={thumbnailUrl(row.original)} name={row.original} size="md"/>
            ),
            enableSorting: false,
        },
        {
            id: 'filename',
            header: 'Filename',
            cell: ({row}) => <span className="text-(--c-text) break-all">{row.original}</span>,
            enableSorting: false,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({row}) => {
                const filename = row.original
                return (
                    <div className="flex items-center justify-center gap-1">
                        <RowActionButton
                            onClick={() => onPreview(filename)}
                            aria-label={`Preview ${filename}`}
                            title="Preview image"
                        >
                            <Eye className="h-4 w-4"/>
                        </RowActionButton>
                        {canMutate && (
                            <RowActionButton
                                variant="danger"
                                onClick={() => onDeleteOne(filename)}
                                aria-label={`Delete ${filename}`}
                                title="Delete image"
                            >
                                <Trash2 className="h-4 w-4"/>
                            </RowActionButton>
                        )}
                    </div>
                )
            },
            enableSorting: false,
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={images}
            isLoading={isLoading}
            manualPagination
            pageCount={pageCount}
            totalRowCount={data?.totalCount ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            emptyMessage="No images found"
            enableRowSelection
            selectedRowIds={selectedRows}
            onRowSelectionChange={onSelectedRowsChange}
            getRowId={getRowId}
        />
    )
}
