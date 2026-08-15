import {DateFilter, type DateRangePreset, Label, Select} from '@/shared/ui/components'
import {FULFILMENT_STATE_OPTIONS, PAYMENT_STATE_OPTIONS} from '../utils/orderFacets'

/**
 * The three ways the order list narrows. `ALL` clears a facet, which is what the page
 * translates into "send no argument" — the server has no value meaning "any", so an unset
 * filter must be absent rather than sent.
 *
 * The date is held as a preset rather than as resolved bounds: a resolved range is only
 * true on the day it was resolved, so the page turns it into dates at the moment it
 * queries.
 */
export interface OrderListFilters {
    paymentState: string
    fulfilmentState: string
    datePreset: DateRangePreset
}

interface OrderListToolbarProps {
    filters: OrderListFilters
    /**
     * Reports only the field that moved. The toolbar knows what changed; it does not know
     * what a change invalidates, so merging and the page reset stay with the page.
     */
    onChange: (patch: Partial<OrderListFilters>) => void
}

export function OrderListToolbar({filters, onChange}: OrderListToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                {/*
                  No htmlFor on the facets: Select renders a button rather than a native
                  select and takes no id, so an association would point at nothing. ariaLabel
                  gives each one its accessible name.
                */}
                <Label className="mb-0">Payment</Label>
                <Select
                    options={PAYMENT_STATE_OPTIONS}
                    value={filters.paymentState}
                    onChange={(paymentState) => onChange({paymentState})}
                    ariaLabel="Filter by payment status"
                    className="min-w-48"
                />
            </div>
            <div className="flex items-center gap-2">
                <Label className="mb-0">Fulfilment</Label>
                <Select
                    options={FULFILMENT_STATE_OPTIONS}
                    value={filters.fulfilmentState}
                    onChange={(fulfilmentState) => onChange({fulfilmentState})}
                    ariaLabel="Filter by fulfilment status"
                    className="min-w-48"
                />
            </div>
            <DateFilter
                value={filters.datePreset}
                onChange={(datePreset) => onChange({datePreset})}
                ariaLabel="Filter by order date"
            />
        </div>
    )
}
