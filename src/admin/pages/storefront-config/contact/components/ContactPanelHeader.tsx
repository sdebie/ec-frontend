import type {ReactNode} from 'react'
import {Card} from '@/shared/ui/primitives'

interface ContactPanelHeaderProps {
    icon: ReactNode
    title: string
    description?: string
    action?: ReactNode
}

/** Icon badge + title + optional description + trailing action, shared by every Contact Settings panel. */
export function ContactPanelHeader({icon, title, description, action}: ContactPanelHeaderProps) {
    return (
        <Card.Header className="m-0 flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex items-center gap-3">
                <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-accent-subtle) text-(--c-accent)"
                    aria-hidden="true"
                >
                    {icon}
                </span>
                <div>
                    <p>{title}</p>
                    {description && <p className="text-sm font-normal text-(--c-text-muted)">{description}</p>}
                </div>
            </div>
            {action}
        </Card.Header>
    )
}
