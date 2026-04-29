import {useMemo, useState} from 'react'
import {getHostname} from '@/utils/HostnameResolver'
import {createAppDataRouter} from '@/app/router/createAppDataRouter'

interface UseAppRouterFactoryOptions {
    isAuthenticated: boolean
    onLoginSuccess: () => void
}

export function useAppRouterFactory({
    isAuthenticated,
    onLoginSuccess,
}: UseAppRouterFactoryOptions) {
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const hostname = getHostname()
    const isAdminDomain = hostname.startsWith('admin.')

    const router = useMemo(
        () =>
            createAppDataRouter({
                hostname,
                isAdminDomain,
                isAuthenticated,
                activeCategory,
                setActiveCategory,
                onLoginSuccess,
            }),
        [activeCategory, hostname, isAdminDomain, isAuthenticated, onLoginSuccess],
    )

    return {
        router,
        hostname,
        isAdminDomain,
    }
}
