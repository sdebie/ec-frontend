import {Search} from 'lucide-react'
import {Input} from '@/shared/ui/primitives'

interface BrandSearchInputProps {
    value: string
    onChange: (value: string) => void
}

export function BrandSearchInput({value, onChange}: BrandSearchInputProps) {
    return (
        <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
            <Input
                placeholder="Search brands by name..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9"
            />
        </div>
    )
}
