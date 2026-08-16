import type {LucideProps} from 'lucide-react'
import type {FC} from 'react'
import {icons} from './iconRegistry'

interface IconProps extends LucideProps {
    name: string
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
