import {useState} from 'react'
import {useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'

import {useStoreSettings} from '@/admin/hooks/settings/useStoreSettings'
import {useSaveStoreSettings} from '@/admin/hooks/settings/useSaveStoreSettings'
import type {StoreSetting} from '@/admin/hooks/settings/types'
import {useCan} from '@/shared/auth/adminPermissions'
import {isApprovedMapEmbedUrl, isValidHttpsUrl} from '@/shared/utils/contactMapUrls'
import {toast} from '@/shared/ui/components'
import type {ContactConfig} from '@/shared/types/StorefrontConfig'

const CONTACT_SETTING_KEY = 'storefront.contact'
const FOOTER_SETTING_KEY = 'storefront.footer'

/** Matches the keys socialIconMap actually renders — 'twitter' is a legacy alias for the same icon as 'x' and is deliberately not offered here. */
export const SOCIAL_LINK_ICONS = ['facebook', 'instagram', 'linkedin', 'x', 'youtube', 'tiktok'] as const

/**
 * The shape `storefront.footer.socialLinks` is actually STORED in — the raw
 * admin setting keys the URL `path`, not `to`. The public `FooterSocialLink`
 * type (`to`) is what the backend's applyFooter() remaps this into for the
 * storefront to read; it is a different shape from what's persisted here.
 * Mirrors the same `path`→`to` remap useAnnouncementPreview.ts already does
 * for its own read-only preview of this identical setting.
 */
interface RawFooterSocialLink {
    id: string
    label: string
    icon: string
    path: string
    external?: boolean
}

const contactSchema = z.object({
    enquiryEmail: z
        .string()
        .transform((s) => s.trim())
        .pipe(
            z.string().refine(
                (val) => val === '' || z.string().email().safeParse(val).success,
                'Must be a valid email address or empty to disable',
            ),
        ),
    emails: z.array(
        z.object({
            value: z
                .string()
                .transform((s) => s.trim())
                .pipe(z.string().email('Invalid email address')),
        }),
    ),
    phones: z.array(
        z.object({
            value: z
                .string()
                .transform((s) => s.trim())
                .pipe(z.string().min(1, 'Phone number is required')),
        }),
    ),
    landline: z.string().optional(),
    whatsapp: z.string().optional(),
    physicalAddress: z.string().optional(),
    businessHours: z.string().optional(),
    responseSla: z.string().optional(),
    mapUrl: z
        .string()
        .optional()
        .refine(
            (val) => !val || isValidHttpsUrl(val),
            'Must be a valid HTTPS URL',
        ),
    mapEmbedUrl: z
        .string()
        .optional()
        .refine(
            (val) => !val || isApprovedMapEmbedUrl(val),
            'Must be an approved map embed URL (Google Maps or OpenStreetMap)',
        ),
    socialLinks: z.array(
        z.object({
            id: z.string(),
            label: z
                .string()
                .transform((s) => s.trim())
                .pipe(z.string().min(1, 'Label is required')),
            to: z
                .string()
                .transform((s) => s.trim())
                .pipe(z.string().refine(isValidHttpsUrl, 'Must be a valid HTTPS URL')),
            icon: z.enum(SOCIAL_LINK_ICONS),
        }),
    ),
})

export type ContactFormValues = z.infer<typeof contactSchema>

function parseContactSetting(value: string | undefined): Omit<ContactFormValues, 'socialLinks'> {
    if (!value) return {
        enquiryEmail: '',
        emails: [],
        phones: [],
        landline: '',
        whatsapp: '',
        physicalAddress: '',
        businessHours: '',
        responseSla: '',
        mapUrl: '',
        mapEmbedUrl: ''
    }
    try {
        const parsed: ContactConfig = JSON.parse(value)
        return {
            enquiryEmail: parsed.enquiryEmail ?? '',
            emails: (parsed.emails ?? []).map((e) => ({value: e})),
            phones: (parsed.phones ?? []).map((p) => ({value: p})),
            landline: parsed.landline ?? '',
            whatsapp: parsed.whatsapp ?? '',
            physicalAddress: parsed.physicalAddress ?? '',
            businessHours: parsed.businessHours ?? '',
            responseSla: parsed.responseSla ?? '',
            mapUrl: parsed.mapUrl ?? '',
            mapEmbedUrl: parsed.mapEmbedUrl ?? '',
        }
    } catch {
        return {
            enquiryEmail: '',
            emails: [],
            phones: [],
            landline: '',
            whatsapp: '',
            physicalAddress: '',
            businessHours: '',
            responseSla: '',
            mapUrl: '',
            mapEmbedUrl: ''
        }
    }
}

/**
 * Kept loosely typed (not the public FooterConfig shape) — this function's
 * job is only to preserve description/footerCallout/columns/legalLinks
 * opaquely through a save, never to read their fields, so a precise type
 * would claim an accuracy this code doesn't rely on.
 */
function parseFooterConfig(value: string | undefined): Record<string, unknown> {
    if (!value) return {}
    try {
        return JSON.parse(value) as Record<string, unknown>
    } catch {
        return {}
    }
}

function parseSocialLinks(footer: Record<string, unknown>): ContactFormValues['socialLinks'] {
    const rawLinks = Array.isArray(footer.socialLinks) ? (footer.socialLinks as RawFooterSocialLink[]) : []
    return rawLinks.map((link) => ({
        id: link.id,
        label: link.label ?? '',
        // Falls back to '' rather than leaving undefined: a malformed/legacy
        // row would otherwise fail zod's required-string check with no field
        // to show the error on, silently blocking the whole form's save.
        to: link.path ?? '',
        icon: (SOCIAL_LINK_ICONS as readonly string[]).includes(link.icon)
            ? (link.icon as (typeof SOCIAL_LINK_ICONS)[number])
            : 'facebook',
    }))
}

function emptyFormValues(): ContactFormValues {
    return {...parseContactSetting(undefined), socialLinks: []}
}

function formToContactConfig(form: ContactFormValues): ContactConfig {
    const config: ContactConfig = {}
    if (form.enquiryEmail?.trim()) config.enquiryEmail = form.enquiryEmail.trim()
    const emails = form.emails.map((e) => e.value.trim()).filter(Boolean)
    if (emails.length) config.emails = emails
    const phones = form.phones.map((p) => p.value.trim()).filter(Boolean)
    if (phones.length) config.phones = phones
    if (form.landline?.trim()) config.landline = form.landline.trim()
    if (form.whatsapp?.trim()) config.whatsapp = form.whatsapp.trim()
    if (form.physicalAddress?.trim()) config.physicalAddress = form.physicalAddress.trim()
    if (form.businessHours?.trim()) config.businessHours = form.businessHours.trim()
    if (form.responseSla?.trim()) config.responseSla = form.responseSla.trim()
    if (form.mapUrl?.trim()) config.mapUrl = form.mapUrl.trim()
    if (form.mapEmbedUrl?.trim()) config.mapEmbedUrl = form.mapEmbedUrl.trim()
    return config
}

function formToSocialLinks(form: ContactFormValues): RawFooterSocialLink[] {
    return form.socialLinks
        .map((link) => ({id: link.id, label: link.label.trim(), path: link.to.trim(), icon: link.icon, external: true}))
        .filter((link) => link.label && link.path)
}

/**
 * Owns the contact settings form: loading the persisted `storefront.contact`
 * setting into react-hook-form, and saving it back. Presentation (panels,
 * nav) lives in ContactEditorPage and its components — this hook knows
 * nothing about layout.
 *
 * Social links live in `storefront.footer.socialLinks` — a different setting
 * key, shared with description/footerCallout/columns/legalLinks that this
 * page never renders. Those fields are carried through untouched on every
 * save (read fresh from `settings`, not form state) so this page can never
 * silently wipe them.
 */
export function useContactForm() {
    const canEdit = useCan('settings:write')
    const {data: settings, isLoading} = useStoreSettings()
    const saveStoreSettings = useSaveStoreSettings()
    const [initialized, setInitialized] = useState(false)

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: emptyFormValues(),
    })

    // Adjusted during render, not in an effect — see useAnnouncementForm for
    // the same pattern; React applies this before paint and `initialized`
    // makes the condition false again on the very next render.
    if (settings && !initialized) {
        const contactSetting = settings.find((s) => s.key === CONTACT_SETTING_KEY)
        const footerSetting = settings.find((s) => s.key === FOOTER_SETTING_KEY)
        reset({
            ...parseContactSetting(contactSetting?.value),
            socialLinks: parseSocialLinks(parseFooterConfig(footerSetting?.value)),
        })
        setInitialized(true)
    }

    const {fields: emailFields, append: appendEmail, remove: removeEmail} = useFieldArray({control, name: 'emails'})
    const {fields: phoneFields, append: appendPhone, remove: removePhone} = useFieldArray({control, name: 'phones'})
    const {fields: socialFields, append: appendSocial, remove: removeSocial} = useFieldArray({control, name: 'socialLinks'})

    function onSubmit(data: ContactFormValues) {
        const contactValue = JSON.stringify(formToContactConfig(data))

        const footerSetting = (settings ?? []).find((s: StoreSetting) => s.key === FOOTER_SETTING_KEY)
        const currentFooterConfig = parseFooterConfig(footerSetting?.value)
        const footerValue = JSON.stringify({...currentFooterConfig, socialLinks: formToSocialLinks(data)})

        saveStoreSettings.mutate(
            [
                {key: CONTACT_SETTING_KEY, value: contactValue},
                {key: FOOTER_SETTING_KEY, value: footerValue},
            ],
            {
                onSuccess: () => {
                    toast.success('Saved')
                },
                onError: () => {
                },
            },
        )
    }

    return {
        canEdit,
        isLoading,
        errors,
        register,
        control,
        onSubmit: handleSubmit(onSubmit),
        isSaving: saveStoreSettings.isPending,
        emailFields,
        appendEmail,
        removeEmail,
        phoneFields,
        appendPhone,
        removePhone,
        socialFields,
        appendSocial,
        removeSocial,
    }
}
