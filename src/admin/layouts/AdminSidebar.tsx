import {useEffect, useMemo, useState} from 'react'
import {matchPath, useLocation} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import {hasRequiredAuthority} from '@/shared/utils/authorizationHelper'
import {adminMenuRoutes} from '@/admin/routes/adminMenuRoutes.config'
import {useClientName} from '@/admin/hooks/useClientName'
import {SidebarItem, SidebarSection} from '@/admin/components/sidebar'
import type {AdminRouteConfig} from '@/admin/types/routes'

// Generic admin-console chrome, not client data — safe as a constant.
const CLIENT_TAGLINE = 'Management Console'

interface AdminSidebarProps {
    isOpen: boolean
    onClose: () => void
    isCollapsed: boolean
    onSetCollapsed: (collapsed: boolean) => void
}

export function AdminSidebar({isOpen, onClose, isCollapsed, onSetCollapsed}: AdminSidebarProps) {
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

    // Sibling groups can share a URL prefix (Categories & Brands live under /admin/products/*, same as Products) — ties resolve to whichever route or child matches the current URL most specifically.
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

    // Accordion: only one group is expanded at a time, seeded from and re-synced to activeGroupKey on navigation; a manual header click (no navigation) sets it directly instead.
    const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(activeGroupKey)

    useEffect(() => {
        setExpandedGroupKey(activeGroupKey)
    }, [activeGroupKey])

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
                    // Width (desktop collapse) and transform (mobile drawer) both animate here, matching AdminHeader's `left` and AdminLayout's margin duration so all three move together.
                    'transition-[width,transform] duration-450',
                    // Desktop: always visible, width changes based on collapsed state
                    'md:translate-x-0',
                    isCollapsed ? 'md:w-20' : 'md:w-64',
                    // Mobile: full width when open, hidden when closed
                    'w-64', isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                )}
            >
                {/* Brand block — h-[60px] matches the fixed header's height (py-3 + 36px content), so the two rows line up. */}
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
                        <SidebarSection
                            key={section}
                            title={section === 'MAIN' ? undefined : section}
                            isCollapsed={isCollapsed}>

                            {routes.map(route => (
                                <li key={route.key} className="w-full list-none">
                                    <SidebarItem
                                        route={route}
                                        isCollapsed={isCollapsed}
                                        setCollapsed={onSetCollapsed}
                                        onItemClick={handleItemClick}
                                        isActiveGroup={route.key === activeGroupKey}
                                        expandedGroupKey={expandedGroupKey}
                                        onExpandGroup={setExpandedGroupKey}
                                    />
                                </li>
                            ))}
                        </SidebarSection>
                    ))}
                </div>
            </aside>
        </>
    )
}
