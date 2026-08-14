import {create} from 'zustand'
import {persist} from 'zustand/middleware'

interface AdminSession {
    token: string
    role: string
    authority: string[]
    userName: string
    email: string
    userId?: string | null
    /** Forced-password-change flag. See `mustResetPassword` below. */
    mustResetPassword?: boolean
}

interface AdminAuthState {
    isSignedIn: boolean
    token: string | null
    role: string | null
    authority: string[]
    userName: string | null
    email: string | null
    userId: string | null
    /**
     * True while the account must change its password before using the portal.
     * Deliberately NOT persisted (`partialize` keeps only `token`) — a stored flag
     * would survive a server-side change to the account. It is re-established from
     * `GET /admin/me` on rehydration, which is why that endpoint must return it.
     */
    mustResetPassword: boolean
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
    mustResetPassword: false,
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            ...initialState,
            setSession: (payload) =>
                set({
                    isSignedIn: true,
                    ...payload,
                    userId: payload.userId ?? null,
                    mustResetPassword: payload.mustResetPassword ?? false,
                }),
            clearSession: () => set(initialState),
        }),
        {
            name: 'ec_admin_token',
            partialize: (state) => ({token: state.token}),
        }
    )
)
