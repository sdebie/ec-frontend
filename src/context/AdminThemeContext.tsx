import React, {createContext, useEffect, useState} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePreset = 'blue' | 'purple' | 'green' | 'orange' | 'red';

interface AdminThemeContextType {
    mode: ThemeMode;
    resolvedMode: 'light' | 'dark';
    preset: ThemePreset;
    setMode: (mode: ThemeMode) => void;
    setPreset: (preset: ThemePreset) => void;
}

export const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({
                                       children,
                                       defaultMode = 'system',
                                       defaultPreset = 'blue',
                                   }: {
    children: React.ReactNode;
    defaultMode?: ThemeMode;
    defaultPreset?: ThemePreset;
}) {
    const [mode, setMode] = useState<ThemeMode>(
        () => (localStorage.getItem('admin-ui-mode') as ThemeMode) || defaultMode
    );

    const [preset, setPreset] = useState<ThemePreset>(
        () => (localStorage.getItem('admin-ui-preset') as ThemePreset) || defaultPreset
    );

    const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-preset', preset);
        localStorage.setItem('admin-ui-preset', preset);
    }, [preset]);

    useEffect(() => {
        const root = window.document.documentElement;
        localStorage.setItem('admin-ui-mode', mode);

        root.classList.remove('light', 'dark');

        if (mode === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);
            setResolvedMode(systemTheme);

            const listener = (e: MediaQueryListEvent) => {
                root.classList.remove('light', 'dark');
                const theme = e.matches ? 'dark' : 'light';
                root.classList.add(theme);
                setResolvedMode(theme);
            };

            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            mq.addEventListener('change', listener);
            return () => mq.removeEventListener('change', listener);
        } else {
            root.classList.add(mode);
            setResolvedMode(mode);
        }
    }, [mode]);

    return (
        <AdminThemeContext.Provider value={{mode, resolvedMode, preset, setMode, setPreset}}>
            {children}
        </AdminThemeContext.Provider>
    );
}
