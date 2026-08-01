import {Navigate, useLocation} from 'react-router-dom'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'

/**
 * Redirects unauthenticated visitors away from account routes.
 *
 * Session restore is NOT done here — `StorefrontLayout` runs
 * `useRestoreCustomerSession` for the whole storefront and withholds the
 * outlet until it settles, so by the time this renders the store is
 * authoritative: a valid token has produced a session, an invalid one has
 * been cleared. `isSignedIn` alone is therefore the complete test.
 */
export function CustomerGuard({children}: { children: React.ReactNode }) {
    const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
    const location = useLocation()

    if (!isSignedIn) {
        return (
            <Navigate
                to={`/account/login?return=${encodeURIComponent(location.pathname)}`}
                replace
            />
        )
    }

    return <>{children}</>
}
