import {useStoreSettings} from '@/admin/hooks/settings/useStoreSettings'
import type {StoreSetting} from '@/admin/hooks/settings/types'
import type {ContactConfig, FooterSocialLink, StorefrontConfig} from '@/shared/types/StorefrontConfig'
import type {AnnouncementFormValues} from './useAnnouncementForm'

// Fields AnnouncementBanner never reads but StorefrontConfig requires — kept
// honest rather than cast past, so a real field added to the type later still
// gets flagged here instead of silently type-checking against a lie.
const PREVIEW_BASE_CONFIG: Omit<StorefrontConfig, 'header' | 'contact' | 'footer'> = {
    clientId: 'preview',
    clientName: 'Preview',
    currency: 'ZAR',
    locale: 'en-ZA',
    theme: {},
    nav: [],
    sections: [],
    branding: {name: 'Preview'},
}

function parsePreviewContact(settings: StoreSetting[]): ContactConfig {
    const row = settings.find((s) => s.key === 'storefront.contact')
    if (!row) return {}
    try {
        return JSON.parse(row.value) as ContactConfig
    } catch {
        return {}
    }
}

// The raw admin setting stores each social link's URL as `path` — the same
// row StorefrontConfigResource.applyFooter() remaps to `to` when it builds the
// public config the real storefront reads. Mirrored here so the preview uses
// the identical field the real AnnouncementBanner expects.
function parsePreviewSocialLinks(settings: StoreSetting[]): FooterSocialLink[] {
    const row = settings.find((s) => s.key === 'storefront.footer')
    if (!row) return []
    try {
        const parsed = JSON.parse(row.value)
        const links = Array.isArray(parsed?.socialLinks) ? parsed.socialLinks : []
        return links.map((link: {id: string; label: string; icon: string; path: string}) => ({
            id: link.id,
            label: link.label,
            icon: link.icon,
            to: link.path,
        }))
    } catch {
        return []
    }
}

/**
 * Builds the synthetic StorefrontConfig the real storefront `AnnouncementBanner`
 * needs to render an accurate preview of the current draft `form`, using the
 * real Contact/Social settings already cached by `useStoreSettings` (same
 * query key as `useAnnouncementForm` — no extra fetch).
 */
export function useAnnouncementPreview(form: AnnouncementFormValues) {
    const {data: settings} = useStoreSettings()

    const previewContact = parsePreviewContact(settings ?? [])
    const previewSocialLinks = parsePreviewSocialLinks(settings ?? [])

    // Mirrors AnnouncementBanner's own "is there anything to show" gate, just
    // enough to decide whether to render it or a placeholder — the real
    // component still owns every visual decision once there's something to show.
    const hasReachableContact = form.showContact && Boolean(
        previewContact.phones?.[0] || previewContact.whatsapp || previewContact.enquiryEmail || previewContact.emails?.[0],
    )
    const hasReachableSocial = form.showSocial && previewSocialLinks.length > 0
    const hasAnythingToPreview = Boolean(form.text) || hasReachableContact || hasReachableSocial

    // Forces enabled: true regardless of the real toggle, so the preview always
    // shows the current draft — matching the existing "fields stay editable
    // while Enabled is off" behaviour instead of going blank while drafting.
    const previewConfig: StorefrontConfig = {
        ...PREVIEW_BASE_CONFIG,
        header: {announcement: {...form, enabled: true}},
        contact: previewContact,
        footer: {socialLinks: previewSocialLinks},
    }

    return {hasAnythingToPreview, previewConfig}
}
