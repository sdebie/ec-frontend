import type {ReactNode} from 'react'
import {cn} from '@/utils/cn'

interface AdaptiveCardProps {
    children: ReactNode
    className?: string
}

export function AdaptiveCard({children, className}: AdaptiveCardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-admin-border bg-admin-panel shadow-sm transition-colors',
                'p-4 sm:p-6',
                className,
            )}
        >
            {children}
        </div>
    )
}