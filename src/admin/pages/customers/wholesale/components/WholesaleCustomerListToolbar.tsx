import {Search} from 'lucide-react'
import {Label, Select} from '@/shared/ui/components'
import {Input} from '@/shared/ui/primitives'

const STATUS_FILTER_OPTIONS = [
    {value: 'ALL', label: 'All'},
    {value: 'ACTIVE', label: 'Active'},
    {value: 'PENDING', label: 'Pending'},
    {value: 'DISABLED', label: 'Disabled'},
]

export interface WholesaleCustomerListToolbarProps {
    status: string
    onStatusChange: (status: string) => void
    searchValue: string
    onSearchChange: (value: string) => void
}

export function WholesaleCustomerListToolbar({
                                                 status,
                                                 onStatusChange,
                                                 searchValue,
                                                 onSearchChange,
                                             }: WholesaleCustomerListToolbarProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="flex items-center gap-2">
                <Label className="mb-0">Status</Label>
                <Select
                    options={STATUS_FILTER_OPTIONS}
                    value={status}
                    onChange={onStatusChange}
                    ariaLabel="Filter by status"
                    className="min-w-48"
                />
            </div>
        </div>
    )
}
