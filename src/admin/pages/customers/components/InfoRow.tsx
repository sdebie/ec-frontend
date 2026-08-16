import type {ReactNode} from 'react'

interface InfoRowProps {
    label: string
    value: ReactNode
}

/** A single label/value line in the "clean information row" pattern. */
export function InfoRow({label, value}: InfoRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-sm text-(--c-text-muted)">
                {label}
            </span>
            <span className="text-right text-sm font-medium text-(--c-text)">
                {value}
            </span>
        </div>
    )
}
