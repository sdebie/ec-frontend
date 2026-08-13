import {ChevronDown, ChevronUp} from 'lucide-react'
import {cn} from '@/shared/utils/cn'
import {Icon} from '@/shared/ui/icons/Icon'
import type {ReactNode} from 'react'

interface SidebarItemContentProps {
    label?: string
    icon?: string | ReactNode
    hasSubMenu?: boolean
    isExpanded?: boolean
    isCollapsed: boolean
}

export function SidebarItemContent({
                                       label,
                                       icon,
                                       hasSubMenu,
                                       isExpanded,
                                       isCollapsed,
                                   }: SidebarItemContentProps) {
    return (
        <div className={cn('flex items-center w-full', isCollapsed ? 'justify-center' : 'justify-between')}>
            <div className="flex items-center gap-3">
                {icon && typeof icon === 'string' ? (
                    <Icon
                        name={icon}
                        className={cn('shrink-0', isCollapsed ? 'w-5 h-5' : 'w-3.5 h-3.5')}
                    />
                ) : icon ? (
                    <span
                        className={cn('shrink-0 flex items-center justify-center', isCollapsed ? 'w-5 h-5' : 'w-3.5 h-3.5',)}>
                        {icon}
                    </span>
                ) : null}
                {!isCollapsed && (
                    <span className="whitespace-nowrap truncate">
                        {label}
                    </span>
                )}
            </div>
            {!isCollapsed && hasSubMenu && (
                <span className="flex items-center text-admin-text-muted shrink-0 ml-auto">
                    {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5"/>
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5"/>
                    )}
                </span>
            )}
        </div>
    )
}
