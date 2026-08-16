import type {ReactNode} from 'react'
import {Info} from 'lucide-react'
import {cn} from '@/shared/utils/cn'

export interface AlertProps {
    title: string
    description: ReactNode
    className?: string
}

/**
 * A page-level informational callout — noticeable without competing with
 * primary actions. Tinted with the preset accent rather than a fixed hue, so
 * it stays "info" (not error/warning) across every admin color preset.
 */
export function Alert({title, description, className}: AlertProps) {
    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-lg border border-primary/20 bg-primary-subtle p-4',
                className,
            )}
        >
            <Info className="h-5 w-5 shrink-0 text-primary"/>
            <div>
                <p className="text-sm font-medium text-(--c-text)">{title}</p>
                <div className="text-sm text-(--c-text-muted)">{description}</div>
            </div>
        </div>
    )
}
