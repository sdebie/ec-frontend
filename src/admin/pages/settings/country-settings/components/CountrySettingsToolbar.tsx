import {Search} from 'lucide-react'
import {Input} from '@/shared/ui/primitives'

interface CountrySettingsToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void
}

export function CountrySettingsToolbar({searchValue, onSearchChange}: CountrySettingsToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                <Input
                    type="text"
                    placeholder="Search countries..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>
        </div>
    )
}
