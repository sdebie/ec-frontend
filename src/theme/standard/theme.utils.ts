import type { ResolvedMode, ThemeName } from './theme.types.ts'
import { presetThemeSchemaConfig } from './themes.ts'

export function getSystemMode(): ResolvedMode {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyResolvedMode(resolvedMode: ResolvedMode) {
    document.documentElement.classList.toggle('dark', resolvedMode === 'dark')
    document.documentElement.setAttribute('data-color-mode', resolvedMode)
}

export function applyPresetTheme(themeName: ThemeName, resolvedMode: ResolvedMode) {
    const theme = presetThemeSchemaConfig[themeName][resolvedMode]
    const root = document.documentElement

    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-primary-deep', theme.primaryDeep)
    root.style.setProperty('--color-primary-mild', theme.primaryMild)
    root.style.setProperty('--color-primary-subtle', theme.primarySubtle)
    root.style.setProperty('--color-neutral', theme.neutral)
    root.setAttribute('data-theme-name', themeName)
}