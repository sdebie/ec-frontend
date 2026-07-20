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
}

export function useAdminLogin() {
    const setSession = useAdminAuthStore((s) => s.setSession)

    return useMutation({
        mutationFn: (credentials: AdminLoginRequest) =>
            adminHttpClient
                .post<AdminLoginResponse>('/admin/auth/login', credentials)
                .then((r) => r.data),
        onSuccess: async (data) => {
            if (!data.resetPassword) {
                // Set token immediately so subsequent requests are authenticated
                setSession({
                    token: data.token,
                    email: data.email,
                    role: data.role,
                    authority: [data.role],
                    userName: data.email,
                })
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
                    })
                } catch {
                    // Non-fatal: userId remains null; self-edit guard treats null as non-self
                }
            }
        },
    })
}
