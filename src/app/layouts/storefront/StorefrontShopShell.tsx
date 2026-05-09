import {StorefrontShell} from './StorefrontShell'

import type {StorefrontShellRenderProps} from '@/configs/storefront/storefrontRegistryTypes'

/**
 * Shop layout currently reuses the base shell.
 * This keeps the layout registry extensible without changing route assembly.
 */
export function StorefrontShopShell(props: StorefrontShellRenderProps) {
    return <StorefrontShell {...props} />
}
