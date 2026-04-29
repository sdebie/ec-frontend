import {CANONICAL_STOREFRONT_PAGE_KEYS, type StorefrontPageKey} from '@/types/storefront/storefrontPageKeys'

const canonicalKeySet = new Set<string>(CANONICAL_STOREFRONT_PAGE_KEYS)

const normalizeLookup = CANONICAL_STOREFRONT_PAGE_KEYS.reduce(
    (lookup, key) => {
        lookup[key.toLowerCase()] = key
        lookup[key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()] = key
        return lookup
    },
    {} as Record<string, StorefrontPageKey>,
)

export function normalizeDiscoveredStorefrontPageKey(
    rawPageKey: string,
): StorefrontPageKey | undefined {
    const trimmedKey = rawPageKey.trim()
    if (!trimmedKey) {
        return undefined
    }

    if (canonicalKeySet.has(trimmedKey)) {
        return trimmedKey as StorefrontPageKey
    }

    return normalizeLookup[trimmedKey.toLowerCase()] ??
        normalizeLookup[trimmedKey.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()]
}
