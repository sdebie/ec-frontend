import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import type { NavItem } from '@/shared/types/StorefrontConfig'

interface StorefrontNavLinkProps {
  item: NavItem
}

export function StorefrontNavLink({ item }: StorefrontNavLinkProps) {
  const isHttpExternal = item.external && /^https?:/.test(item.path)

  if (isHttpExternal) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm transition-colors hover:underline hover:text-(--sf-nav-text-hover)"
      >
        {item.label}
      </a>
    )
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn('text-sm transition-colors hover:underline hover:text-(--sf-nav-text-hover)', isActive && 'font-semibold')
      }
    >
      {item.label}
    </NavLink>
  )
}
