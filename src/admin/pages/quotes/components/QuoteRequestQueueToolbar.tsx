import {Segment} from '@/shared/ui/components'

const STATUS_FILTER_OPTIONS = [
    {value: 'ALL', label: 'All'},
    {value: 'NEW', label: 'New'},
    {value: 'IN_PROGRESS', label: 'In Progress'},
    {value: 'CLOSED', label: 'Closed'},
]

export interface QuoteRequestQueueToolbarProps {
    status: string
    onStatusChange: (status: string) => void
}

export function QuoteRequestQueueToolbar({status, onStatusChange}: QuoteRequestQueueToolbarProps) {
    return (
        <div className="flex flex-col gap-4">
            <Segment
                options={STATUS_FILTER_OPTIONS}
                value={status}
                onChange={onStatusChange}
            />
        </div>
    )
}
