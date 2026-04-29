import {useEffect, useMemo} from 'react'
import {env} from '@/lib/env'
import {validateStorefrontPageInfrastructure} from '@/configs/storefront/storefrontPageValidation'
import {loadStorefrontManifest} from '@/storefront/bootstrap/loadStorefrontManifest'

export function useStorefrontBootstrap() {
    useEffect(() => {
        if (env.storefrontBuildTarget) {
            validateStorefrontPageInfrastructure(env.isCi ? 'fail' : 'warn')
        }
    }, [])

    return useMemo(() => loadStorefrontManifest(), [])
}
