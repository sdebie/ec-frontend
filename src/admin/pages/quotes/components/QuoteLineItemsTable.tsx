import {useMemo, useState} from 'react'
import {PackageOpen, Search} from 'lucide-react'

import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, StatusBadge} from '@/shared/ui/components'
import {Card, Input} from '@/shared/ui/primitives'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {QuoteRequestItem} from '../hooks/useQuoteRequestDetail'

interface QuoteLineItemsTableProps {
    items: QuoteRequestItem[]
}

export function QuoteLineItemsTable({items}: QuoteLineItemsTableProps) {
    const [search, setSearch] = useState('')

    // Only shown once a quote exists — before that, every unitPrice is null and the columns
    // would just be an empty dash down the whole table.
    const isPriced = items.some((item) => item.unitPrice !== null)

    const columns = useMemo<ColumnDef<QuoteRequestItem, unknown>[]>(
        () => {
            const base: ColumnDef<QuoteRequestItem, unknown>[] = [
                {
                    id: 'rowNumber',
                    header: '',
                    enableSorting: false,
                    cell: ({row}) => <span className="text-(--c-text-muted)">{row.index + 1}</span>,
                },
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
            ]

            if (!isPriced) {
                return base
            }

            return [
                ...base,
                {
                    accessorKey: 'unitPrice',
                    header: () => <div className="text-right">Unit Price</div>,
                    cell: ({row}) => (
                        <div className="text-right">{formatAmount(row.original.unitPrice)}</div>
                    ),
                },
                {
                    accessorKey: 'lineTotal',
                    header: () => <div className="text-right">Line Total</div>,
                    cell: ({row}) => (
                        <div className="text-right font-medium">{formatAmount(row.original.lineTotal)}</div>
                    ),
                },
            ]
        },
        [isPriced],
    )

    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-accent-subtle) text-(--c-accent)">
                        <PackageOpen className="h-4 w-4" aria-hidden="true"/>
                    </span>
                    <span>Requested Items</span>
                    <StatusBadge label={`${items.length} ${items.length === 1 ? 'item' : 'items'}`} color="gray"/>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--c-text-muted)"/>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search requested items..."
                        className="pl-9"
                    />
                </div>
            </Card.Header>
            <Card.Body className="p-5">
                <DataTable
                    columns={columns}
                    data={items}
                    showSearch={false}
                    globalFilter={search}
                    onGlobalFilterChange={setSearch}
                    emptyMessage="No items in this request"
                />
            </Card.Body>
        </Card>
    )
}
