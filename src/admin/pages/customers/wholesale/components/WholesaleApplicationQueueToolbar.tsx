import {DateFilter, type DateRangePreset, Label, Select} from '@/shared/ui/components'

const STATUS_FILTER_OPTIONS = [
    {value: 'ALL', label: 'All'},
    {value: 'PENDING', label: 'Pending'},
    {value: 'APPROVED', label: 'Approved'},
    {value: 'REJECTED', label: 'Rejected'},
]

export interface WholesaleApplicationQueueToolbarProps {
    status: string
    onStatusChange: (status: string) => void
    datePreset: DateRangePreset
    onDatePresetChange: (preset: DateRangePreset) => void
}

export function WholesaleApplicationQueueToolbar({
                                                     status,
                                                     onStatusChange,
                                                     datePreset,
                                                     onDatePresetChange,
                                                 }: WholesaleApplicationQueueToolbarProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <DateFilter
                value={datePreset}
                onChange={onDatePresetChange}
                ariaLabel="Filter by submitted date"
            />
        </div>
    )
}
