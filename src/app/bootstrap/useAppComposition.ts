import {useCallback} from 'react'
import {useAdminAuthState} from '@/app/bootstrap/useAdminAuthState'
import {useAppRouterFactory} from '@/app/bootstrap/useAppRouterFactory'
import {useStorefrontBootstrap} from '@/app/bootstrap/useStorefrontBootstrap'
import {env} from '@/lib/env'

export function useAppComposition() {
    const {isAuthenticated, setAuthenticated} = useAdminAuthState()
    const handleLoginSuccess = useCallback(() => {
        setAuthenticated()
    }, [setAuthenticated])

    const {router, hostname} = useAppRouterFactory({
        isAuthenticated,
        onLoginSuccess: handleLoginSuccess,
    })

    const manifest = useStorefrontBootstrap()
    const forcedClientId = env.isDev ? env.storefrontTenant : undefined

    return {
        router,
        storefrontOptions: {hostname, forcedClientId},
        manifestGeneratedAt: manifest.generatedAt,
    }
}
