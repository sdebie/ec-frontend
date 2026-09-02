import {useEffect} from 'react'
import {useThemeStore} from '@/admin/stores/themeStore'

interface ThemeApplierProps {
    targetRef: React.RefObject<HTMLDivElement | null>
}

export function ThemeApplier({targetRef}: ThemeApplierProps) {
    const mode = useThemeStore((s) => s.mode)
    const preset = useThemeStore((s) => s.preset)

    useEffect(() => {
        const el = targetRef.current
        if (!el) return

        const mq =
            typeof window !== 'undefined' && window.matchMedia
                ? window.matchMedia('(prefers-color-scheme: dark)')
                : null

        const apply = () => {
            let resolved: 'light' | 'dark'

            if (mode === 'system') {
                resolved = mq?.matches ? 'dark' : 'light'
            } else {
                resolved = mode
            }

            el.dataset.theme = resolved
            el.dataset.preset = preset

            // Mirror onto <body> so portal-rendered components (toasts, dropdowns,
            // dialogs) that attach at document.body receive the same admin theming.
            document.body.dataset.surface = 'admin'
            document.body.dataset.theme = resolved
            document.body.dataset.preset = preset
        }

        apply()

        const cleanupBody = () => {
            delete document.body.dataset.surface
            delete document.body.dataset.theme
            delete document.body.dataset.preset
        }

        if (mode === 'system' && mq) {
            mq.addEventListener('change', apply)
            return () => {
                mq.removeEventListener('change', apply)
                cleanupBody()
            }
        }

        return cleanupBody
    }, [mode, preset, targetRef])

    return null
}
