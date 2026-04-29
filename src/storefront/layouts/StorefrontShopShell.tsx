import type {StorefrontShellRenderProps} from '@/storefront/registry/types'
import {StorefrontShell} from './StorefrontShell'

/**
 * Shop layout currently reuses the base shell.
 * This keeps the layout registry extensible without changing route assembly.
 */
export function StorefrontShopShell(props: StorefrontShellRenderProps) {
    return <StorefrontShell {...props} />
}
