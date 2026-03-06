export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedMode = 'light' | 'dark'

export type Variables =
    | 'primary'
    | 'primaryDeep'
    | 'primaryMild'
    | 'primarySubtle'
    | 'neutral'

export type ThemeVariables = Record<ResolvedMode, Record<Variables, string>>

export type ThemeName = 'default' | 'mono' | 'green' | 'purple' | 'orange'