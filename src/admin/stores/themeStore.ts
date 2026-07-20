import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemePreset = 'blue' | 'purple' | 'green' | 'orange' | 'red'

interface ThemeState {
  mode: ThemeMode
  preset: ThemePreset
  setMode: (mode: ThemeMode) => void
  setPreset: (preset: ThemePreset) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      preset: 'blue',
      setMode: (mode) => set({ mode }),
      setPreset: (preset) => set({ preset }),
    }),
    { name: 'ec_admin_theme' }
  )
)
