import {
    Import,
    LayoutDashboard,
    Mail,
    Megaphone,
    Menu,
    Package,
    Scale,
    Settings,
    Star,
    Store,
    Users,
    Warehouse,
    type LucideProps,
} from 'lucide-react'
import type {FC} from 'react'

interface IconProps extends LucideProps {
    name: string
}

const icons: Record<string, FC<LucideProps>> = {
    'layout-dashboard': LayoutDashboard,
    store: Store,
    import: Import,
    package: Package,
    users: Users,
    warehouse: Warehouse,
    menu: Menu,
    mail: Mail,
    megaphone: Megaphone,
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
