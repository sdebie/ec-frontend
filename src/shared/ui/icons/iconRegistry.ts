import {
    FileSpreadsheet,
    Import,
    LayoutDashboard,
    LayoutGrid,
    type LucideProps,
    Mail,
    Megaphone,
    Menu,
    Package,
    Quote,
    Scale,
    Settings,
    Star,
    Store,
    Users,
    Warehouse,
} from 'lucide-react'
import type {FC} from 'react'

/**
 * The names a route's `meta.icon` may be looked up by. An unregistered name renders
 * nothing at all, so anything the menu config names must appear here.
 *
 * Kept out of `Icon.tsx` so the lookup table can be read by callers — a module that
 * exports both a component and a value loses Fast Refresh for the whole file.
 */
export const icons: Record<string, FC<LucideProps>> = {
    'file-spreadsheet': FileSpreadsheet,
    'layout-dashboard': LayoutDashboard,
    'layout-grid': LayoutGrid,
    store: Store,
    import: Import,
    package: Package,
    users: Users,
    warehouse: Warehouse,
    menu: Menu,
    mail: Mail,
    megaphone: Megaphone,
    quote: Quote,
    scale: Scale,
    star: Star,
    settings: Settings,
}

/** Every name `Icon` can resolve, so a caller's name can be checked against the registry. */
export const ICON_NAMES = Object.keys(icons)
