import {useCallback} from 'react'
import {ToastContainer} from '@/components/shared/toast'
import {AppProviders} from '@/app/providers/AppProviders'
import {env} from '@/lib/env'
import {useAdminAuthState} from '@/app/bootstrap/useAdminAuthState'
import {useStorefrontBootstrap} from '@/app/bootstrap/useStorefrontBootstrap'
import {useAppRouterFactory} from '@/app/bootstrap/useAppRouterFactory'

function App() {
    const {isAuthenticated, setAuthenticated} = useAdminAuthState()
    const handleLogin = useCallback(() => {
        setAuthenticated()
    }, [setAuthenticated])
    const {router, hostname} = useAppRouterFactory({
        isAuthenticated,
        onLoginSuccess: handleLogin,
    })
    const manifest = useStorefrontBootstrap()
    const forcedClientId = env.isDev ? env.storefrontTenant : undefined

    return (
        <AppProviders storefrontOptions={{hostname, forcedClientId}} router={router}>
            {/* Manifest bootstrap seam loaded at app startup for normalization. */}
            <div
                data-storefront-manifest-generated={manifest.generatedAt}
                className="hidden"
            />
            <ToastContainer/>
        </AppProviders>
    )
}

export default App
