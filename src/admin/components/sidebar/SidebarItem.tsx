import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import { SidebarItemContent } from './SidebarItemContent'
import { SidebarSubMenu } from './SidebarSubMenu'
import type { AdminRouteConfig } from '@/admin/types/routes'

interface SidebarItemProps {
  route: AdminRouteConfig
  isChild?: boolean
  isCollapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  onItemClick?: () => void
}

export function SidebarItem({
  route,
  isChild,
  isCollapsed,
  setCollapsed,
  onItemClick,
}: SidebarItemProps) {
  if (route.subMenu && route.subMenu.length > 0) {
    return (
      <SidebarSubMenu
        route={route}
        isCollapsed={isCollapsed}
        setCollapsed={setCollapsed}
        onItemClick={onItemClick}
      />
    )
  }

  return (
    <NavLink
      to={route.path}
      end={route.meta.menuMatch === 'exact'}
      title={isCollapsed ? route.meta.label : undefined}
      onClick={onItemClick}
      className={({ isActive }) =>
        cn(
          'group flex items-center rounded-[var(--c-radius)] mb-0.5 w-full text-sm',
          isCollapsed ? 'justify-center px-2 py-1.5' : 'px-3 py-1.5',
          isChild && !isCollapsed && 'pl-4 relative z-10',
          isActive
            ? cn(
                'bg-primary-subtle text-primary font-semibold ring-2 ring-primary',
                isChild && 'border-l-2 border-primary'
              )
            : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
        )
      }
    >
      <SidebarItemContent
        label={route.meta.label}
        icon={route.meta.icon}
        isCollapsed={isCollapsed}
      />
    </NavLink>
  )
}
