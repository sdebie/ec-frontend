import {parseSlotContribution} from '@/configs/storefront/storefrontContractsSchema'

import type {
    StorefrontClientConfig,
    StorefrontSlotContribution,
    StorefrontSlotId,
} from '@/types/storefront/storefrontTypes'


export function listSlotContributions(
    config: StorefrontClientConfig,
    slotId: StorefrontSlotId,
): StorefrontSlotContribution[] {
    return (config.slots ?? [])
        .map((slot) => parseSlotContribution(slot))
        .filter((slot): slot is StorefrontSlotContribution => Boolean(slot))
        .filter((slot) => slot.slot === slotId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}
