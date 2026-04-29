import type {ReactNode} from 'react'
import {listSlotContributions} from '@/storefront/registry/slotRegistry'
import type {StorefrontClientConfig, StorefrontSlotId} from '@/types/storefront/storefrontTypes'

interface StorefrontSlotProps {
    storefrontConfig: StorefrontClientConfig
    slotId: StorefrontSlotId
    fallback?: ReactNode
}

export function StorefrontSlot({
    storefrontConfig,
    slotId,
    fallback = null,
}: StorefrontSlotProps) {
    const contributions = listSlotContributions(storefrontConfig, slotId)

    if (contributions.length === 0) {
        return <>{fallback}</>
    }

    return (
        <>
            {contributions.map((entry) => (
                <section
                    key={entry.id}
                    data-storefront-slot={slotId}
                    className="mx-auto w-full max-w-6xl px-4 py-4"
                >
                    {entry.content.title && (
                        <h2 className="text-lg font-semibold text-(--sf-text)">{entry.content.title}</h2>
                    )}
                    {entry.content.description && (
                        <p className="mt-1 text-sm text-(--sf-muted-text)">{entry.content.description}</p>
                    )}
                </section>
            ))}
        </>
    )
}
