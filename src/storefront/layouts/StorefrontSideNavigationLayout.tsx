import { useState, type ComponentType, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

export interface StorefrontSideNavigationItem {
  to: string
  label: string
  icon?: ComponentType<{ className?: string }>
}

interface StorefrontSideNavigationLayoutProps {
  items: StorefrontSideNavigationItem[]
  children: ReactNode
  navigationLabel: string
  mobileMenuLabel: string
  showNavigation: boolean
}

function navigationLinkClass(isActive: boolean) {
  return cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-(--sf-accent) font-semibold text-(--sf-accent-text) hover:opacity-90'
      : 'text-(--sf-muted-text) hover:bg-(--sf-surface-muted) hover:text-(--sf-text)',
  )
}

interface NavigationLinksProps {
  items: StorefrontSideNavigationItem[]
  onNavigate?: () => void
}

function NavigationLinks({ items, onNavigate }: NavigationLinksProps) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink to={to} onClick={onNavigate} className={({ isActive }) => navigationLinkClass(isActive)}>
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

/**
 * Responsive storefront work-area layout. Consumers supply their own route
 * links and page content, keeping this free of customer- or product-specific
 * assumptions.
 */
export function StorefrontSideNavigationLayout({
  items,
  children,
  navigationLabel,
  mobileMenuLabel,
  showNavigation,
}: StorefrontSideNavigationLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!showNavigation) return <>{children}</>

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-1 overflow-hidden rounded-xl border border-(--sf-border) bg-(--sf-panel)">
        <div className="flex flex-1 flex-col md:flex-row">
          <nav
            aria-label={navigationLabel}
            className="hidden w-56 shrink-0 border-r border-(--sf-border) p-6 md:block"
          >
            <NavigationLinks items={items} />
          </nav>

          <div className="border-b border-(--sf-border) p-4 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuLabel}
              className="inline-flex items-center gap-2 rounded-md border border-(--sf-border) px-3 py-2 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted)"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
              {mobileMenuLabel}
            </button>
          </div>

          <div className="min-w-0 flex-1 p-6 sm:p-8">{children}</div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label={navigationLabel}
            className="relative flex h-full w-72 flex-col bg-(--sf-panel) text-(--sf-text) shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-(--sf-border) p-4">
              <h2 className="text-lg font-semibold">{navigationLabel}</h2>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-1.5 text-(--sf-muted-text) hover:bg-(--sf-surface-muted) hover:text-(--sf-text)"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label={navigationLabel} className="p-4">
              <NavigationLinks items={items} onNavigate={() => setMobileMenuOpen(false)} />
            </nav>
          </section>
        </div>
      )}
    </div>
  )
}
