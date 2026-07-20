import {useEffect, useState} from 'react'
import {Navigate, useLocation} from 'react-router-dom'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import {mapShopperType} from '@/storefront/customer/auth/utils/mapShopperType'
import type {StorefrontMeResponse} from '@/storefront/customer/auth/types'

export function CustomerGuard({children}: { children: React.ReactNode }) {
    const {token, isSignedIn, setSession, clearSession} = useCustomerAuthStore()
    const location = useLocation()
    const needsRehydration = !!token && !isSignedIn
    const [checking, setChecking] = useState(needsRehydration)

    useEffect(() => {
        if (!token || isSignedIn) return

        const controller = new AbortController()
        storefrontHttpClient
            .get<StorefrontMeResponse>('/storefront/customer-portal', {
                signal: controller.signal,
            })
            .then(({data}) => {
                setSession({
                    token,
                    email: data.email,
                    customerType: mapShopperType(data.shopperType),
                })
            })
            .catch((err) => {
                if (err?.name !== 'CanceledError') clearSession()
            })
            .finally(() => setChecking(false))

        return () => controller.abort()
    }, [token, isSignedIn, setSession, clearSession])

    if (!token) {
        return (
            <Navigate
                to={`/account/login?return=${encodeURIComponent(location.pathname)}`}
                replace
            />
        )
    }

    if (checking) return <div aria-busy="true" aria-label="Loading"/>

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
