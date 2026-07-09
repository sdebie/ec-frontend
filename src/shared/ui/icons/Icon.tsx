import type {LucideProps} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type {FC} from 'react'

interface IconProps extends LucideProps {
    name: string
}

export const Icon: FC<IconProps> = ({name, ...props}) => {
    const pascalName = name
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('')

    const LucideIcon =
        (LucideIcons as unknown as Record<string, FC<LucideProps>>)[pascalName] ||
        (LucideIcons as unknown as Record<string, FC<LucideProps>>)[name]

    if (!LucideIcon) {
        if (import.meta.env.DEV) {
            console.warn(`Icon "${name}" (as "${pascalName}") not found in lucide-react`)
        }
        return null
    }

    return <LucideIcon {...props} />
}
