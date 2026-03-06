import {
    createContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import type {ThemeMode, ThemeName, ResolvedMode} from './theme.types.ts'
import {
    getStoredMode,
    getStoredPreset,
    setStoredMode,
    setStoredPreset,
} from './theme.storage.ts'
import {
    applyPresetTheme,
    applyResolvedMode,
    getSystemMode,
} from './theme.utils.ts'

type ThemeContextValue = {
    mode: ThemeMode
    resolvedMode: ResolvedMode
    preset: ThemeName
    setMode: (mode: ThemeMode) => void
    setPreset: (preset: ThemeName) => void
    toggleLightDark: () => void
    resetToSystem: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

type Props = {
    children: ReactNode
}

export function ThemeProvider({children}: Props) {
    const [mode, setMode] = useState<ThemeMode>(() => getStoredMode() ?? 'system')
    const [preset, setPreset] = useState<ThemeName>(() => getStoredPreset() ?? 'default')
    const [systemMode, setSystemMode] = useState<ResolvedMode>(() => getSystemMode())

    const resolvedMode: ResolvedMode = mode === 'system' ? systemMode : mode

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)')

        const onChange = () => {
            setSystemMode(media.matches ? 'dark' : 'light')
        }

        media.addEventListener('change', onChange)
        return () => media.removeEventListener('change', onChange)
    }, [])

    useEffect(() => {
        applyResolvedMode(resolvedMode)
        applyPresetTheme(preset, resolvedMode)
        setStoredMode(mode)
        setStoredPreset(preset)
    }, [mode, preset, resolvedMode])

    const value = useMemo<ThemeContextValue>(() => ({
        mode,
        resolvedMode,
        preset,
        setMode,
        setPreset,
        toggleLightDark: () => {
            setMode(current => {
                const active = current === 'system' ? systemMode : current
                return active === 'dark' ? 'light' : 'dark'
            })
        },
        resetToSystem: () => setMode('system'),
    }), [mode, resolvedMode, preset, systemMode])

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}