import {StorefrontShell} from './StorefrontShell'
import type {StorefrontLayoutRegistry} from '@/storefront/registry/types'

/**
 * Dormant layout registry for phased storefront route grouping.
 */
export const layoutRegistry: StorefrontLayoutRegistry = {
    default: StorefrontShell,
}

