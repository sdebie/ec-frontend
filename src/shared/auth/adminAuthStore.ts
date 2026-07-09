import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminSession {
  token: string
  role: string
  authority: string[]
  userName: string
  email: string
  userId?: string | null
}

interface AdminAuthState {
  isSignedIn: boolean
  token: string | null
  role: string | null
  authority: string[]
  userName: string | null
  email: string | null
  userId: string | null
  setSession: (payload: AdminSession) => void
  clearSession: () => void
}

const initialState: Omit<AdminAuthState, 'setSession' | 'clearSession'> = {
  isSignedIn: false,
  token: null,
  role: null,
  authority: [],
  userName: null,
  email: null,
  userId: null,
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (payload) => set({ isSignedIn: true, ...payload, userId: payload.userId ?? null }),
      clearSession: () => set(initialState),
    }),
    {
      name: 'ec_admin_token',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
