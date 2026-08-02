import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'
import type { NavItem } from '@/shared/types/StorefrontConfig'

interface StorefrontNavLinkProps {
  item: NavItem
  /** 'nav' (default) renders inline in the desktop nav bar; 'drawer' renders full-width in the mobile NavDrawer. */
  variant?: 'nav' | 'drawer'
}

const CTA_CHIP_BASE =
  'rounded-full border border-(--sf-accent) px-3 py-1 text-sm font-medium text-(--sf-accent) transition-colors hover:bg-[color-mix(in_srgb,var(--sf-accent)_12%,transparent)]'

const CTA_CHIP_ACTIVE =
  'bg-(--sf-accent) text-(--sf-accent-text) border-(--sf-accent)'

const CTA_DRAWER_BASE =
  'block w-full rounded-full border border-(--sf-accent) px-4 py-2 text-center text-sm font-medium text-(--sf-accent) transition-colors hover:bg-[color-mix(in_srgb,var(--sf-accent)_12%,transparent)]'

const CTA_DRAWER_ACTIVE =
  'bg-(--sf-accent) text-(--sf-accent-text) border-(--sf-accent)'

/**
 * Default (non-CTA) nav item base classes.
 * The transparent `border-b-2` reserves layout so switching to the accent
 * underline on activation causes no shift.
 */
const DEFAULT_NAV_BASE =
  'text-sm transition-colors border-b-2 border-transparent'

/**
 * Drawer items get a pill, not the nav bar's underline: a full-width rule under
 * a stacked list read as a divider rather than a state, and looked heavy.
 * The active pill is a soft accent tint — enough to locate yourself, not enough
 * to compete with the CTA chip in the same list.
 */
const DEFAULT_DRAWER_BASE =
  'block rounded-md px-3 py-2 text-sm transition-colors'

const DEFAULT_DRAWER_ACTIVE =
  'bg-[color-mix(in_srgb,var(--sf-accent)_10%,transparent)] font-medium text-(--sf-accent)'

const DEFAULT_DRAWER_IDLE =
  'text-(--sf-text) hover:bg-(--sf-surface-muted)'

export function StorefrontNavLink({ item, variant = 'nav' }: StorefrontNavLinkProps) {
  const isHttpExternal = item.external && /^https?:/.test(item.path)
  const isCta = item.emphasis === 'cta'
  const isDrawer = variant === 'drawer'

  if (isHttpExternal) {
    return (
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        className={
          isCta
            ? (isDrawer ? CTA_DRAWER_BASE : CTA_CHIP_BASE)
            : isDrawer
              ? cn(DEFAULT_DRAWER_BASE, DEFAULT_DRAWER_IDLE)
              : DEFAULT_NAV_BASE
        }
      >
        {item.label}
      </a>
    )
  }

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) => {
        if (isCta) {
          const base = isDrawer ? CTA_DRAWER_BASE : CTA_CHIP_BASE
          const active = isDrawer ? CTA_DRAWER_ACTIVE : CTA_CHIP_ACTIVE
          return cn(base, isActive && active)
        }
        if (isDrawer) {
          return cn(DEFAULT_DRAWER_BASE, isActive ? DEFAULT_DRAWER_ACTIVE : DEFAULT_DRAWER_IDLE)
        }
        return cn(
          DEFAULT_NAV_BASE,
          isActive
            ? 'font-semibold border-(--sf-accent)'
            : 'hover:border-(--sf-nav-text-hover)',
        )
      }}
    >
      {item.label}
    </NavLink>
  )
}
