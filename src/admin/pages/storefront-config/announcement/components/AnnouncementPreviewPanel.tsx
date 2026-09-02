import {Eye} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {StorefrontConfig} from '@/shared/types/StorefrontConfig'
import {AnnouncementBanner} from '@/storefront/layouts/AnnouncementBanner'

/**
 * Renders the actual storefront `AnnouncementBanner` component against a
 * synthetic preview config, rather than a hand-approximated copy of its
 * markup — the two can never visually drift apart this way.
 *
 * `previewMode` tells the real banner to ignore its own below-`md` hiding
 * rules, which assume the viewer's own device is the configured audience's
 * device — true on the real storefront, false here (the admin's device has
 * nothing to do with which shoppers see the bar). Without it, the identical
 * component would render as an empty box on any admin screen narrower than
 * `md`, since CSS media queries only ever read the true viewport.
 */
export function AnnouncementPreviewPanel({
    hasAnythingToPreview,
    previewConfig,
}: {
    hasAnythingToPreview: boolean
    previewConfig: StorefrontConfig
}) {
    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 flex items-center gap-3 px-5 py-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-accent-subtle) text-(--c-accent)">
                    <Eye className="h-4 w-4" aria-hidden="true"/>
                </span>
                <span>Preview</span>
            </Card.Header>
            <Card.Body className="px-5 py-4">
                {hasAnythingToPreview ? (
                    <div
                        className="w-full overflow-hidden rounded-lg border border-(--c-border)"
                        style={{'--sf-ring': 'var(--c-ring)'} as React.CSSProperties}
                        // Inert: this is a preview, not the live bar — a click should
                        // never dial a number or open WhatsApp from inside admin.
                        aria-hidden="true"
                    >
                        <div className="pointer-events-none">
                            <StorefrontConfigContext.Provider value={previewConfig}>
                                <AnnouncementBanner previewMode/>
                            </StorefrontConfigContext.Provider>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-(--c-border) px-4 py-6 text-center text-sm text-(--c-text-muted)">
                        Nothing to preview yet — add announcement text below, or turn on a contact or social slot
                        with reachable data.
                    </div>
                )}
                <p className="mt-2 text-xs text-(--c-text-muted)">
                    Shows your current draft even while Enabled is off — flip Enabled on below to publish it live.
                </p>
            </Card.Body>
        </Card>
    )
}
