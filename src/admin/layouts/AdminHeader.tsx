import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, Monitor } from 'lucide-react'

const clientName = import.meta.env.VITE_CLIENT_NAME ?? 'Admin Portal'
const clientTagline = import.meta.env.VITE_CLIENT_TAGLINE ?? 'Management Console'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useThemeStore, type ThemeMode, type ThemePreset } from '@/admin/stores/themeStore'
import { useBreadcrumbItems } from '@/admin/context/BreadcrumbContext'
import { cn } from '@/shared/utils/cn'

const presetColors: Record<ThemePreset, string> = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f97316',
  red: '#ef4444',
}

interface AdminHeaderProps {
  onMenuClick: () => void
  isCollapsed?: boolean
}

export function AdminHeader({ onMenuClick, isCollapsed }: AdminHeaderProps) {
  const navigate = useNavigate()
  const { userName, clearSession } = useAdminAuthStore()
  const breadcrumbs = useBreadcrumbItems()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { mode, preset, setMode, setPreset } = useThemeStore()

  const handleLogout = () => {
    clearSession()
    navigate('/admin/login', { replace: true })
  }

  const avatarInitial = userName ? userName.charAt(0).toUpperCase() : 'A'

  return (
    <header className={cn(
      'fixed top-0 right-0 z-60 bg-admin-sidebar-bg border-b border-admin-border',
      isCollapsed ? 'md:left-20' : 'md:left-64',
      'left-0',
    )}>
      <div className="flex px-4 py-3 justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-sidebar-hover rounded-[var(--c-radius)] transition-colors"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="w-6 h-6" />
          </button>
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-sm text-(--c-text-muted)">
                {breadcrumbs.map((item, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span aria-hidden className="select-none">›</span>}
                    {item.href && i < breadcrumbs.length - 1 ? (
                      <Link to={item.href} className="hover:text-(--c-text) transition-colors">{item.label}</Link>
                    ) : (
                      <span className={i === breadcrumbs.length - 1 ? 'text-(--c-text) font-medium' : ''}>{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Branding */}
          <div className="hidden md:flex flex-col leading-tight mr-1">
            <span className="text-sm font-bold tracking-tight text-(--c-text)">{clientName}</span>
            <span className="text-xs text-(--c-text-muted)">{clientTagline}</span>
          </div>

          <div className="h-8 w-px bg-admin-border hidden md:block"></div>

          <Link
            to="/"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-admin-text hover:text-primary transition-colors"
          >
            <span className="bg-admin-sidebar-hover text-admin-text-muted px-2.5 py-1.5 rounded-[var(--c-radius)] border border-admin-border hover:border-primary/30 transition-colors">
              View Store
            </span>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="cursor-pointer"
              title="Staff Profile"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-tr from-primary to-primary-subtle text-white font-bold text-sm shadow-md ring-2 ring-admin-panel cursor-pointer">
                {avatarInitial}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-admin-panel border border-admin-border rounded-[var(--c-radius-lg)] shadow-lg py-1 z-50">
                {userName && (
                  <div className="px-4 py-2 text-sm text-admin-text-muted border-b border-admin-border">
                    {userName}
                  </div>
                )}

                {/* Theme mode */}
                <div className="px-4 py-2.5 border-b border-admin-border">
                  <p className="text-xs text-admin-text-muted mb-2">Theme</p>
                  <div className="flex bg-admin-sidebar-hover rounded-full p-1 border border-admin-border w-fit">
                    {([
                      { value: 'light' as ThemeMode, icon: Sun, label: 'Light Mode' },
                      { value: 'system' as ThemeMode, icon: Monitor, label: 'System Theme' },
                      { value: 'dark' as ThemeMode, icon: Moon, label: 'Dark Mode' },
                    ] as const).map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMode(value)}
                        title={label}
                        aria-label={label}
                        className={`p-1.5 rounded-full transition-colors ${
                          mode === value
                            ? 'bg-admin-panel text-primary shadow-sm'
                            : 'text-admin-text-muted hover:text-admin-text'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent colour */}
                <div className="px-4 py-2.5 border-b border-admin-border">
                  <p className="text-xs text-admin-text-muted mb-2">Accent</p>
                  <div className="flex items-center gap-2">
                    {(Object.keys(presetColors) as ThemePreset[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPreset(p)}
                        aria-label={`Select ${p} accent`}
                        className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${preset === p ? 'ring-2 ring-offset-1 ring-offset-admin-panel' : ''}`}
                        style={{ backgroundColor: presetColors[p] }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-admin-text hover:bg-admin-sidebar-hover transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
