import { useEffect } from 'react'
import { useThemeStore } from '@/admin/stores/themeStore'

interface ThemeApplierProps {
  targetRef: React.RefObject<HTMLDivElement | null>
}

export function ThemeApplier({ targetRef }: ThemeApplierProps) {
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
    }

    apply()

    if (mode === 'system' && mq) {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [mode, preset, targetRef])

  return null
}
