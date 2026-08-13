import {useMemo, useState} from 'react'
import {matchPath, useLocation} from 'react-router-dom'
import {hasRequiredAuthority} from '@/shared/utils/authorizationHelper'
import {cn} from '@/shared/utils/cn'
import {SidebarItem} from './SidebarItem'
import {SidebarItemContent} from './SidebarItemContent'
import type {AdminRouteConfig} from '@/admin/types/routes'

interface SidebarSubMenuProps {
    route: AdminRouteConfig
    isCollapsed: boolean
    setCollapsed: (collapsed: boolean) => void
    onItemClick?: () => void
}

export function SidebarSubMenu({
                                   route,
                                   isCollapsed,
                                   setCollapsed,
                                   onItemClick,
                               }: SidebarSubMenuProps) {
    const location = useLocation()

    const authorizedChildren = useMemo(
        () =>
            route.subMenu?.filter((child) =>
                hasRequiredAuthority(child.authority),
            ) ?? [],
        [route.subMenu],
    )

    const matchesRoute = (targetRoute: AdminRouteConfig) => {
        const end = targetRoute.meta.menuMatch === 'exact'
        return Boolean(matchPath({path: targetRoute.path, end}, location.pathname))
    }

    const hasActiveChild = authorizedChildren.some((child) => matchesRoute(child))
    const isParentActive = matchesRoute(route) || hasActiveChild
    const [isExpanded, setIsExpanded] = useState(() => hasActiveChild)

    const toggleExpand = () => {
        if (isCollapsed) {
            setCollapsed(false)
            setIsExpanded(true)
            return
        }
        setIsExpanded((prev) => !prev)
    }

    return (
        <div className="flex flex-col w-full">
            <button
                onClick={toggleExpand}
                type="button"
                className={cn('w-full flex items-center rounded-(--c-radius) group text-left cursor-pointer text-[13px]',
                    isCollapsed ? 'justify-center px-2 py-1.5' : 'px-3 py-1.5',
                    isParentActive ? 'bg-primary-subtle text-primary font-semibold' : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',)}
                title={isCollapsed ? route.meta.label : undefined}>
                <SidebarItemContent
                    label={route.meta.label ?? ''}
                    icon={route.meta.icon}
                    hasSubMenu={true}
                    isExpanded={isExpanded}
                    isCollapsed={isCollapsed}
                />
            </button>

            {!isCollapsed && isExpanded && authorizedChildren.length > 0 && (
                <ul className="pl-8 mt-0.5 py-0.5 space-y-0.5 relative rounded-(--c-radius)">
                    <div
                        className={cn('absolute left-5.5 top-0 bottom-0 w-px', hasActiveChild ? 'bg-primary' : 'bg-(--c-border)',)}
                    />
                    {authorizedChildren.map((child) => (
                        <li key={child.key} className="relative z-10 w-full">
                            <SidebarItem
                                route={child}
                                isChild={true}
                                isCollapsed={isCollapsed}
                                setCollapsed={setCollapsed}
                                onItemClick={onItemClick}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
