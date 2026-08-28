import {useEffect, useRef, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {ChevronDown, ChevronUp, Menu, Monitor, Moon, Sun} from 'lucide-react'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {StaffRoleLabels, type StaffRoles} from '@/shared/types/enums/StaffRoles'
import {type ThemeMode, type ThemePreset, useThemeStore} from '@/admin/stores/themeStore'
import {useBreadcrumbItems} from '@/admin/context/BreadcrumbContext'
import {cn} from '@/shared/utils/cn'

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
    onToggleCollapsed: () => void
}

export function AdminHeader({onMenuClick, isCollapsed, onToggleCollapsed}: AdminHeaderProps) {
    const navigate = useNavigate()
    const {userName, role, clearSession} = useAdminAuthStore()
    const breadcrumbs = useBreadcrumbItems()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const {mode, preset, setMode, setPreset} = useThemeStore()

    // Dismiss on click-away and Escape; `mousedown` (not `click`) closes the menu before the pointer lands underneath, and listeners attach only while open so a closed menu costs nothing.
    useEffect(() => {
        if (!dropdownOpen) return

        const onPointerDown = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setDropdownOpen(false)
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setDropdownOpen(false)
        }

        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [dropdownOpen])

    const handleLogout = () => {
        clearSession()
        navigate('/admin/login', {replace: true})
    }

    const avatarInitial = userName ? userName.charAt(0).toUpperCase() : 'A'
    const roleLabel = role ? StaffRoleLabels[role as StaffRoles] : undefined

    return (
        <header className={cn(
            'fixed top-0 right-0 z-60 bg-admin-sidebar-bg border-b border-admin-sidebar-border transition-[left] duration-450',
            isCollapsed ? 'md:left-20' : 'md:left-64', 'left-0',)}>
            <div className="flex px-4 py-3 justify-between items-center w-full">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="md:hidden p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-sidebar-hover rounded-(--c-radius) transition-colors"
                    >
                        <span className="sr-only">
                            Open sidebar
                        </span>
                        <Menu className="w-6 h-6"/>
                    </button>
                    <button
                        type="button"
                        onClick={onToggleCollapsed}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="hidden md:flex p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-sidebar-hover rounded-(--c-radius) transition-colors"
                    >
                        <span className="sr-only">
                            {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        </span>
                        <Menu className="w-6 h-6"/>
                    </button>
                    {breadcrumbs.length > 0 && (
                        <nav aria-label="Breadcrumb">
                            <ol className="flex items-center gap-1.5 text-sm text-(--c-text-muted)">
                                {breadcrumbs.map((item, i) => (
                                    <li key={i} className="flex items-center gap-1.5">
                                        {i > 0 &&
                                            <span aria-hidden className="select-none">
                                                ›
                                            </span>
                                        }
                                        {item.href && i < breadcrumbs.length - 1 ? (
                                            <Link to={item.href} className="hover:text-(--c-text) transition-colors">
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <span
                                                className={i === breadcrumbs.length - 1 ? 'text-(--c-text) font-medium' : ''}>
                                                {item.label}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/"
                          className="hidden md:flex items-center gap-2 text-sm font-medium text-admin-text hover:text-primary transition-colors">
                        <span
                            className="bg-admin-sidebar-hover text-admin-text-muted px-2.5 py-1.5 rounded-(--c-radius) border border-admin-border hover:border-primary/30 transition-colors">
                            View Store
                        </span>
                    </Link>

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2.5 cursor-pointer rounded-(--c-radius) px-1.5 py-1 hover:bg-admin-sidebar-hover transition-colors"
                            title="Staff Profile"
                            aria-haspopup="menu"
                            aria-expanded={dropdownOpen}
                        >
                            <div
                                className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-tr from-primary to-primary-subtle text-(--c-accent-text) font-bold text-sm shadow-md ring-2 ring-admin-panel shrink-0">
                                {avatarInitial}
                            </div>
                            {/* Identity is hidden below md, where the header has no room for it — the avatar alone still opens the same menu. */}
                            {userName && (
                                <span className="hidden md:flex flex-col items-start leading-tight text-left">
                                    <span className="text-xs font-semibold text-admin-text">
                                        {userName}
                                    </span>
                                    {roleLabel && (
                                        <span className="text-xs font-light text-admin-text-muted">
                                            {roleLabel}
                                        </span>
                                    )}
                                </span>
                            )}
                            {/* Points the way the menu will move, so the control reads as a toggle. */}
                            {dropdownOpen ? (
                                <ChevronUp className="w-4 h-4 text-admin-text-muted shrink-0" aria-hidden="true"/>
                            ) : (
                                <ChevronDown className="w-4 h-4 text-admin-text-muted shrink-0" aria-hidden="true"/>
                            )}
                        </button>

                        {dropdownOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 w-52 bg-admin-panel border border-admin-border rounded-(--c-radius-lg) shadow-lg py-1 z-50"
                            >
                                {/* Repeated inside the menu for the sub-md case, where the trigger shows the avatar only. */}
                                {userName && (
                                    <div className="px-4 py-2 border-b border-admin-border md:hidden">
                                        <p className="text-sm font-semibold text-admin-text">
                                            {userName}
                                        </p>
                                        {roleLabel &&
                                            <p className="text-xs text-admin-text-muted">
                                                {roleLabel}
                                            </p>
                                        }
                                    </div>
                                )}

                                {/* Theme mode */}
                                <div className="px-4 py-2.5 border-b border-admin-border">
                                    <p className="text-xs text-admin-text-muted mb-2">
                                        Theme
                                    </p>
                                    <div
                                        className="flex bg-admin-sidebar-hover rounded-full p-1 border border-admin-border w-fit">
                                        {([
                                            {value: 'light' as ThemeMode, icon: Sun, label: 'Light Mode'},
                                            {value: 'system' as ThemeMode, icon: Monitor, label: 'System Theme'},
                                            {value: 'dark' as ThemeMode, icon: Moon, label: 'Dark Mode'},
                                        ] as const).map(({value, icon: Icon, label}) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setMode(value)}
                                                title={label}
                                                aria-label={label}
                                                className={`p-1.5 rounded-full transition-colors 
                                                ${mode === value ? 'bg-admin-panel text-primary shadow-sm' : 'text-admin-text-muted hover:text-admin-text'}`}>
                                                <Icon className="w-4 h-4"/>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Accent colour */}
                                <div className="px-4 py-2.5 border-b border-admin-border">
                                    <p className="text-xs text-admin-text-muted mb-2">
                                        Accent
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {(Object.keys(presetColors) as ThemePreset[]).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPreset(p)}
                                                aria-label={`Select ${p} accent`}
                                                className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${preset === p ? 'ring-2 ring-offset-1 ring-offset-admin-panel' : ''}`}
                                                style={{backgroundColor: presetColors[p]}}
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
