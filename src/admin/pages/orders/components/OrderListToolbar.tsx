import {Label, Select} from '@/shared/ui/components'
import {Input} from '@/shared/ui/primitives'
import {FULFILMENT_STATE_OPTIONS, PAYMENT_STATE_OPTIONS} from '../utils/orderFacets'

/**
 * The four ways the order list narrows. `ALL` clears a facet and `''` clears a date, which
 * is what the page translates into "send no argument" — the server has no value meaning
 * "any", so an unset filter must be absent rather than sent.
 */
export interface OrderListFilters {
    paymentState: string
    fulfilmentState: string
    fromDate: string
    toDate: string
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
                  No htmlFor on the two facets: Select renders a button rather than a native
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
            <div className="flex items-center gap-2">
                <Label htmlFor="from-date" className="mb-0">
                    From
                </Label>
                <Input
                    id="from-date"
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => onChange({fromDate: e.target.value})}
                />
            </div>
            <div className="flex items-center gap-2">
                <Label htmlFor="to-date" className="mb-0">
                    To
                </Label>
                <Input
                    id="to-date"
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => onChange({toDate: e.target.value})}
                />
            </div>
        </div>
    )
}
