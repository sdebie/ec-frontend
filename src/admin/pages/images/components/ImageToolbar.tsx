import {LayoutGrid, List, Search} from 'lucide-react'
import {ToggleGroup} from '@/shared/ui/components'
import {Input} from '@/shared/ui/primitives'

export type ImageViewMode = 'grid' | 'list'

interface ImageToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void
    view: ImageViewMode
    onViewChange: (view: ImageViewMode) => void
}

const VIEW_OPTIONS = [
    {
        value: 'grid',
        label: 'Grid',
        icon: <LayoutGrid className="h-4 w-4"/>
    },
    {
        value: 'list',
        label: 'List',
        icon: <List className="h-4 w-4"/>
    },
]

export function ImageToolbar({searchValue, onSearchChange, view, onViewChange}: ImageToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                <Input
                    placeholder="Search images..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <ToggleGroup
                options={VIEW_OPTIONS}
                value={view}
                onChange={(value) => onViewChange(value as ImageViewMode)}
                size="md"
            />
        </div>
    )
}
