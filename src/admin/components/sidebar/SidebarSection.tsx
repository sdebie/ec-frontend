import type {ReactNode} from 'react'

interface SidebarSectionProps {
    title?: string
    children: ReactNode
    isCollapsed?: boolean
}

export function SidebarSection({title, children, isCollapsed}: SidebarSectionProps) {
    return (
        <div className="mb-4 w-full">
            {title && !isCollapsed && (
                <h3 className="px-3 mb-1 text-[0.65rem] font-bold tracking-wider uppercase text-admin-text-muted shrink-0">
                    {title}
                </h3>
            )}
            <ul className="space-y-0.5 w-full flex flex-col items-start min-w-0">
                {children}
            </ul>
        </div>
    )
}
