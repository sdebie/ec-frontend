import type {StorefrontClientConfig, StorefrontCmsPageDefinition} from '@/types/storefront/storefrontTypes'
import {parseCmsPageDefinition} from '@/storefront/registry/storefrontContractsSchema'

/**
 * Resolve a CMS page by exact path. Fail-closed by returning undefined
 * when no configured page exists.
 */
export function resolveCmsPageForPath(
    storefrontConfig: StorefrontClientConfig,
    path: string,
): StorefrontCmsPageDefinition | undefined {
    return storefrontConfig.pages?.cms
        ?.map((page) => parseCmsPageDefinition(page))
        .find(
            (page): page is StorefrontCmsPageDefinition =>
                page != null && page.path === path,
        )
}
