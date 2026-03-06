import {
    createContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import type {
    AdminThemeMode,
    AdminThemePreset,
    ResolvedAdminThemeMode,
} from './admin-theme.types'

type AdminThemeContextValue = {
    mode: AdminThemeMode
    resolvedMode: ResolvedAdminThemeMode
    preset: AdminThemePreset
    setMode: (mode: AdminThemeMode) => void
    setPreset: (preset: AdminThemePreset) => void
}

export const AdminThemeContext = createContext<AdminThemeContextValue | null>(null)

const MODE_STORAGE_KEY = 'admin-theme-mode'
const PRESET_STORAGE_KEY = 'admin-theme-preset'

function getSystemMode(): ResolvedAdminThemeMode {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredMode(): AdminThemeMode {
    const value = localStorage.getItem(MODE_STORAGE_KEY)

    if (value === 'light' || value === 'dark' || value === 'system') {
        return value
    }

    return 'system'
}

function getStoredPreset(): AdminThemePreset {
    const value = localStorage.getItem(PRESET_STORAGE_KEY)

    if (
        value === 'default' ||
        value === 'mono' ||
        value === 'green' ||
        value === 'purple' ||
        value === 'orange'
    ) {
        return value
    }

    return 'default'
}

type Props = {
    children: ReactNode
}

export function AdminThemeProvider({children}: Props) {
    const [mode, setMode] = useState<AdminThemeMode>(() => getStoredMode())
    const [preset, setPreset] = useState<AdminThemePreset>(() => getStoredPreset())
    const [systemMode, setSystemMode] = useState<ResolvedAdminThemeMode>(() => getSystemMode())

    const resolvedMode: ResolvedAdminThemeMode =
        mode === 'system' ? systemMode : mode

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = () => {
            setSystemMode(mediaQuery.matches ? 'dark' : 'light')
        }

        handleChange()
        mediaQuery.addEventListener('change', handleChange)

        return () => {
            mediaQuery.removeEventListener('change', handleChange)
        }
    }, [])

    useEffect(() => {
        const root = document.documentElement

        root.classList.toggle('dark', resolvedMode === 'dark')
        root.setAttribute('data-admin-theme-mode', mode)
        root.setAttribute('data-admin-theme-resolved', resolvedMode)
        root.setAttribute('data-admin-theme-preset', preset)

        localStorage.setItem(MODE_STORAGE_KEY, mode)
        localStorage.setItem(PRESET_STORAGE_KEY, preset)
    }, [mode, preset, resolvedMode])

    const value = useMemo<AdminThemeContextValue>(
        () => ({
            mode,
            resolvedMode,
            preset,
            setMode,
            setPreset,
        }),
        [mode, resolvedMode, preset]
    )

    return (
        <AdminThemeContext.Provider value={value}>
            {children}
        </AdminThemeContext.Provider>
    )
}