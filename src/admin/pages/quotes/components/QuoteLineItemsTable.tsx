import {useMemo} from 'react'

import type {ColumnDef} from '@/shared/ui/components'
import {DataTable} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import type {QuoteRequestItem} from '../hooks/useQuoteRequestDetail'

interface QuoteLineItemsTableProps {
    items: QuoteRequestItem[]
}

export function QuoteLineItemsTable({items}: QuoteLineItemsTableProps) {
    const columns = useMemo<ColumnDef<QuoteRequestItem, unknown>[]>(
        () => [
            {
                accessorKey: 'productNameSnapshot',
                header: 'Product Name',
                cell: ({row}) => (
                    <>
                        {row.original.productNameSnapshot}
                        {row.original.variantId === null && (
                            <span className="ml-2 text-xs italic text-(--c-text-muted)">
                                (variant removed)
                            </span>
                        )}
                    </>
                ),
            },
            {
                accessorKey: 'variantSkuSnapshot',
                header: 'Variant / SKU',
                cell: ({row}) => row.original.variantSkuSnapshot || '-',
            },
            {
                accessorKey: 'quantity',
                header: 'Quantity',
            },
        ],
        [],
    )

    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 px-5 py-4">
                Requested Items ({items.length})
            </Card.Header>
            <Card.Body className="p-5">
                <DataTable
                    columns={columns}
                    data={items}
                    showSearch
                    globalSearchPlaceholder="Search items..."
                    emptyMessage="No items in this request"
                />
            </Card.Body>
        </Card>
    )
}
