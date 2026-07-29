import {useMutation} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

interface AdminLoginRequest {
    email: string
    password: string
}

interface AdminLoginResponse {
    token: string
    email: string
    role: string
    resetPassword: boolean
}

interface AdminMeResponse {
    id: string | null
    role: string
    authority: string[]
    userName: string
    email: string
    resetPassword?: boolean
}

export function useAdminLogin() {
    const setSession = useAdminAuthStore((s) => s.setSession)

    return useMutation({
        mutationFn: (credentials: AdminLoginRequest) =>
            adminHttpClient
                .post<AdminLoginResponse>('/admin/auth/login', credentials)
                .then((r) => r.data),
        onSuccess: async (data) => {
            // The session is established even when a password change is required.
            // The reset endpoint is authenticated, so discarding the token here left
            // the request anonymous and the forced-change flow could never complete.
            // AdminGuard keeps the portal closed while mustResetPassword is true.
            setSession({
                token: data.token,
                email: data.email,
                role: data.role,
                authority: [data.role],
                userName: data.email,
                mustResetPassword: data.resetPassword,
            })

            if (data.resetPassword) {
                // Nothing further to enrich — the user cannot reach any screen that
                // needs userId until the password change completes.
                return
            }

            // Fetch userId from /admin/me — required for self-edit detection
            try {
                const me = await adminHttpClient
                    .get<AdminMeResponse>('/admin/me')
                    .then((r) => r.data)
                setSession({
                    token: data.token,
                    email: me.email,
                    role: me.role,
                    authority: me.authority,
                    userName: me.userName,
                    userId: me.id,
                    mustResetPassword: me.resetPassword ?? true,
                })
            } catch {
                // Non-fatal: userId remains null; self-edit guard treats null as non-self
            }
        },
    })
}
