import type {ReactNode} from 'react'
import type {LucideIcon} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'

interface WholesaleApplicationDetailHeaderProps {
    icon?: LucideIcon
    title: string
    action?: ReactNode
}

/** A detail-card section header: an accent-coloured icon, a title, and an optional right-aligned slot. */
export function WholesaleApplicationDetailHeader({icon: Icon, title, action}: WholesaleApplicationDetailHeaderProps) {
    return (
        <Card.Header className="m-0 flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-6 w-6 text-primary"/>}
                <span>
                    {title}
                </span>
            </div>
            {action}
        </Card.Header>
    )
}
