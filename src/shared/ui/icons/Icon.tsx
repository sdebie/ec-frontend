import {
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

interface IconProps extends LucideProps {
    name: string
}

const icons: Record<string, FC<LucideProps>> = {
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

export const Icon: FC<IconProps> = ({name, ...props}) => {
    const LucideIcon = icons[name]

    if (!LucideIcon) {
        if (import.meta.env.DEV) {
            console.warn(`Icon "${name}" is not configured`)
        }
        return null
    }

    return <LucideIcon {...props} />
}
