import {useEffect, useMemo} from 'react'
import {matchPath, useLocation} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import {hasRequiredAuthority} from '@/shared/utils/authorizationHelper'
import {adminMenuRoutes} from '@/admin/routes/adminMenuRoutes.config'
import {useClientName} from '@/admin/hooks/useClientName'
import {NavToggle, SidebarItem, SidebarSection} from '@/admin/components/sidebar'
import type {AdminRouteConfig} from '@/admin/types/routes'

// Generic admin-console chrome, not client data — safe as a constant.
const CLIENT_TAGLINE = 'Management Console'

interface AdminSidebarProps {
    isOpen: boolean
    onClose: () => void
    isCollapsed: boolean
    onToggleCollapsed: () => void
    onSetCollapsed: (collapsed: boolean) => void
}

export function AdminSidebar({isOpen, onClose, isCollapsed, onToggleCollapsed, onSetCollapsed}: AdminSidebarProps) {
    const clientName = useClientName()

    const authorizedRoutes = useMemo(() =>
            adminMenuRoutes.filter(route => hasRequiredAuthority(route.authority)),
        [],
    )

    const routesBySection = useMemo(() => {
        const grouped: Record<string, AdminRouteConfig[]> = {}
        authorizedRoutes.forEach(route => {
            const section = route.meta.section ?? 'MAIN'
            if (!grouped[section]) grouped[section] = []
            grouped[section].push(route)
        })
        return grouped
    }, [authorizedRoutes])

    const location = useLocation()

    // Several groups' children still share a URL prefix with a sibling (e.g. Categories
    // & Brands' pages live under /admin/products/*, same as Products' own pages), so a
    // plain prefix check against one group's path can also match another group's
    // children. Resolve the ambiguity by picking whichever route (top-level path or any
    // of its children) matches the current URL most specifically — longest match wins.
    const activeGroupKey = useMemo(() => {
        let bestKey: string | null = null
        let bestLength = -1

        const consider = (groupKey: string, path: string, exact: boolean) => {
            if (!matchPath({path, end: exact}, location.pathname)) return
            if (path.length > bestLength) {
                bestLength = path.length
                bestKey = groupKey
            }
        }

        authorizedRoutes.forEach(route => {
            consider(route.key, route.path, route.meta.menuMatch === 'exact')
            route.subMenu?.forEach(child => {
                if (hasRequiredAuthority(child.authority)) {
                    consider(route.key, child.path, child.meta.menuMatch === 'exact')
                }
            })
        })

        return bestKey
    }, [authorizedRoutes, location.pathname])

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // Handle clicking a menu item on mobile
    const handleItemClick = () => {
        if (isOpen) {
            onClose()
        }
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 bottom-0 z-50 bg-admin-sidebar-bg border-r border-admin-sidebar-border overflow-hidden flex flex-col',
                    // Desktop: always visible, width changes based on collapsed state
                    'md:translate-x-0',
                    isCollapsed ? 'md:w-20' : 'md:w-64',
                    // Mobile: full width when open, hidden when closed
                    'w-64', isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                )}
            >
                {/* Brand block — h-[60px] matches the fixed header's height (py-3 +
            36px content, header has no border) so the two rows line up. */}
                <div
                    className={cn('flex h-15 shrink-0 items-center', isCollapsed ? 'md:justify-center md:px-2' : '', 'px-4',)}>
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-(--c-radius) bg-primary-subtle text-sm font-bold text-primary">
                        {clientName ? clientName.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div className={cn('ml-3 flex min-w-0 flex-col leading-tight', isCollapsed && 'md:hidden')}>
                        <span className="truncate text-sm font-bold tracking-tight text-admin-text">
                            {clientName}
                        </span>
                        <span className="truncate text-xs text-admin-text-muted">
                            {CLIENT_TAGLINE}
                        </span>
                    </div>
                </div>

                <div className="flex-1 px-3 pt-4 pb-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {Object.entries(routesBySection).map(([section, routes]) => (
                        <SidebarSection key={section} title={section} isCollapsed={isCollapsed}>
                            {routes.map(route => (
                                <li key={route.key} className="w-full list-none">
                                    <SidebarItem
                                        route={route}
                                        isCollapsed={isCollapsed}
                                        setCollapsed={onSetCollapsed}
                                        onItemClick={handleItemClick}
                                        isActiveGroup={route.key === activeGroupKey}
                                    />
                                </li>
                            ))}
                        </SidebarSection>
                    ))}
                </div>

                {/* Desktop collapse toggle */}
                <div className="hidden md:flex items-center justify-center border-t border-admin-sidebar-border p-2">
                    <NavToggle toggled={isCollapsed} onToggle={onToggleCollapsed}/>
                </div>
            </aside>
        </>
    )
}
