import { useEffect, useMemo } from 'react'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'

import { cn } from '@/shared/utils/cn'
import { hasRequiredAuthority } from '@/shared/utils/authorizationHelper'
import { adminMenuRoutes } from '@/admin/routes/adminMenuRoutes.config'
import { SidebarItem, SidebarSection } from '@/admin/components/sidebar'
import type { AdminRouteConfig } from '@/admin/types/routes'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapsed: () => void
  onSetCollapsed: (collapsed: boolean) => void
}

export function AdminSidebar({ isOpen, onClose, isCollapsed, onToggleCollapsed, onSetCollapsed }: AdminSidebarProps) {

  const authorizedRoutes = useMemo(
    () => adminMenuRoutes.filter(route => hasRequiredAuthority(route.authority)),
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
          'w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
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
                  />
                </li>
              ))}
            </SidebarSection>
          ))}
        </div>

        {/* Desktop collapse toggle */}
        <div className="hidden md:flex items-center justify-center border-t border-admin-sidebar-border p-2">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="p-2 rounded-[var(--c-radius)] text-admin-text-muted hover:bg-admin-sidebar-hover hover:text-admin-text transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  )
}
