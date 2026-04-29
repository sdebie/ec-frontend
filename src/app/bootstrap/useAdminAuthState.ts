import {useCallback, useEffect, useState} from 'react'

function hasAdminToken(): boolean {
    if (typeof window === 'undefined') return false
    return !!window.localStorage.getItem('admin_token')
}

export function useAdminAuthState() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasAdminToken)
    const setAuthenticated = useCallback(() => setIsAuthenticated(true), [])

    useEffect(() => {
        const syncAuth = () => setIsAuthenticated(hasAdminToken())
        window.addEventListener('storage', syncAuth)
        return () => window.removeEventListener('storage', syncAuth)
    }, [])

    return {
        isAuthenticated,
        setAuthenticated,
    }
}
