export type AdminThemeMode = 'light' | 'dark' | 'system'
export type ResolvedAdminThemeMode = 'light' | 'dark'

export type AdminThemeVariable =
    | 'primary'
    | 'primaryDeep'
    | 'primaryMild'
    | 'primarySubtle'
    | 'neutral'

export type AdminThemeVariables = Record<ResolvedAdminThemeMode, Record<AdminThemeVariable, string>>

export type AdminThemePreset =
    | 'default'
    | 'mono'
    | 'green'
    | 'purple'
    | 'orange'