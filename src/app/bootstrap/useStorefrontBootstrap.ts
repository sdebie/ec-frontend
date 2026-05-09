import {useEffect, useMemo} from 'react'

import {loadStorefrontManifest} from '@/app/bootstrap/loadStorefrontManifest'
import {validateStorefrontPageInfrastructure} from '@/configs/storefront/storefrontPageValidation'
import {env} from '@/lib/env'

export function useStorefrontBootstrap() {
    useEffect(() => {
        if (env.storefrontBuildTarget) {
            validateStorefrontPageInfrastructure(env.isCi ? 'fail' : 'warn')
        }
    }, [])

    return useMemo(() => loadStorefrontManifest(), [])
}
