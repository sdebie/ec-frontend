import type { ThemeMode, ThemeName } from './theme.types.ts'

const MODE_KEY = 'admin-theme-mode'
const PRESET_KEY = 'admin-theme-preset'

export function getStoredMode(): ThemeMode | null {
    const value = localStorage.getItem(MODE_KEY)
    if (value === 'light' || value === 'dark' || value === 'system') {
        return value
    }
    return null
}

export function setStoredMode(mode: ThemeMode) {
    localStorage.setItem(MODE_KEY, mode)
}

export function getStoredPreset(): ThemeName | null {
    const value = localStorage.getItem(PRESET_KEY)
    if (
        value === 'default' ||
        value === 'mono' ||
        value === 'green' ||
        value === 'purple' ||
        value === 'orange'
    ) {
        return value
    }
    return null
}

export function setStoredPreset(preset: ThemeName) {
    localStorage.setItem(PRESET_KEY, preset)
}