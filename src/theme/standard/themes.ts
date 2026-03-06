import type { ThemeVariables, ThemeName } from './theme.types.ts'

export const presetThemeSchemaConfig: Record<ThemeName, ThemeVariables> = {
    default: {
        light: {
            primary: '#2a85ff',
            primaryDeep: '#0069f6',
            primaryMild: '#4996ff',
            primarySubtle: '#2a85ff1a',
            neutral: '#ffffff',
        },
        dark: {
            primary: '#2a85ff',
            primaryDeep: '#0069f6',
            primaryMild: '#4996ff',
            primarySubtle: '#2a85ff1a',
            neutral: '#ffffff',
        },
    },
    mono: {
        light: {
            primary: '#18181b',
            primaryDeep: '#09090b',
            primaryMild: '#27272a',
            primarySubtle: '#18181b0d',
            neutral: '#ffffff',
        },
        dark: {
            primary: '#ffffff',
            primaryDeep: '#09090b',
            primaryMild: '#e5e7eb',
            primarySubtle: '#ffffff1a',
            neutral: '#111827',
        },
    },
    green: {
        light: {
            primary: '#0CAF60',
            primaryDeep: '#088d50',
            primaryMild: '#34c779',
            primarySubtle: '#0CAF601a',
            neutral: '#ffffff',
        },
        dark: {
            primary: '#0CAF60',
            primaryDeep: '#088d50',
            primaryMild: '#34c779',
            primarySubtle: '#0CAF601a',
            neutral: '#ffffff',
        },
    },
    purple: {
        light: {
            primary: '#8C62FF',
            primaryDeep: '#704acc',
            primaryMild: '#a784ff',
            primarySubtle: '#8C62FF1a',
            neutral: '#ffffff',
        },
        dark: {
            primary: '#8C62FF',
            primaryDeep: '#704acc',
            primaryMild: '#a784ff',
            primarySubtle: '#8C62FF1a',
            neutral: '#ffffff',
        },
    },
    orange: {
        light: {
            primary: '#fb732c',
            primaryDeep: '#cc5c24',
            primaryMild: '#fc8f56',
            primarySubtle: '#fb732c1a',
            neutral: '#ffffff',
        },
        dark: {
            primary: '#fb732c',
            primaryDeep: '#cc5c24',
            primaryMild: '#fc8f56',
            primarySubtle: '#fb732c1a',
            neutral: '#ffffff',
        },
    },
}