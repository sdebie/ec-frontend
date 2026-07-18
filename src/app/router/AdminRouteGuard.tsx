import {Navigate} from 'react-router-dom'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

interface AdminRouteGuardProps {
    authority: string[]
    children: React.ReactNode
}

/** Enforces per-route staff authority after the session-level AdminGuard. */
export function AdminRouteGuard({authority, children}: AdminRouteGuardProps) {
    const grantedAuthorities = useAdminAuthStore((state) => state.authority)

    if (authority.length > 0 && !authority.some((role) => grantedAuthorities.includes(role))) {
        return <Navigate to="/admin" replace/>
    }

    return <>{children}</>
}
