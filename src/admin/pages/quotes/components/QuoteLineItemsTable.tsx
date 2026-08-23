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
                header: () => <div className="text-right">Quantity</div>,
                cell: ({row}) => <div className="text-right">{row.original.quantity}</div>,
            },
        ],
        [],
    )

    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 flex items-center justify-between px-5 py-4">
                <span>Requested Items</span>
                <span className="text-sm font-normal text-(--c-text-muted)">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
            </Card.Header>
            <Card.Body className="p-5">
                <DataTable
                    columns={columns}
                    data={items}
                    showSearch
                    globalSearchPlaceholder="Search requested items..."
                    emptyMessage="No items in this request"
                />
            </Card.Body>
        </Card>
    )
}
