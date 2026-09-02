import {Label, Select} from '@/shared/ui/components'

const STATUS_FILTER_OPTIONS = [
    {value: 'ALL', label: 'All'},
    {value: 'NEW', label: 'New'},
    {value: 'IN_PROGRESS', label: 'In Progress'},
    {value: 'QUOTE_SENT', label: 'Quote Sent'},
    {value: 'CLOSED', label: 'Closed'},
]

export interface QuoteRequestQueueToolbarProps {
    status: string
    onStatusChange: (status: string) => void
}

export function QuoteRequestQueueToolbar({status, onStatusChange}: QuoteRequestQueueToolbarProps) {
    return (
        <div className="flex items-center gap-2">
            <Label className="mb-0">
                Status
            </Label>
            <Select
                options={STATUS_FILTER_OPTIONS}
                value={status}
                onChange={onStatusChange}
                ariaLabel="Filter by status"
                className="min-w-48"
            />
        </div>
    )
}
