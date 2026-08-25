import {useState} from 'react'
import {useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'

import {useStoreSettings} from '@/admin/hooks/settings/useStoreSettings'
import {useUpdateSetting} from '@/admin/hooks/settings/useUpdateSetting'
import {useCan} from '@/shared/auth/adminPermissions'
import {isApprovedMapEmbedUrl, isValidHttpsUrl} from '@/shared/utils/contactMapUrls'
import {toast} from '@/shared/ui/components'
import type {ContactConfig} from '@/shared/types/StorefrontConfig'

const SETTING_KEY = 'storefront.contact'

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
})

export type ContactFormValues = z.infer<typeof contactSchema>

function parseContactSetting(value: string | undefined): ContactFormValues {
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

/**
 * Owns the contact settings form: loading the persisted `storefront.contact`
 * setting into react-hook-form, and saving it back. Presentation (panels,
 * tabs) lives in ContactEditorPage and its components — this hook knows
 * nothing about layout.
 */
export function useContactForm() {
    const canEdit = useCan('settings:write')
    const {data: settings, isLoading} = useStoreSettings()
    const updateSetting = useUpdateSetting()
    const [initialized, setInitialized] = useState(false)

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: parseContactSetting(undefined),
    })

    // Adjusted during render, not in an effect — see useAnnouncementForm for
    // the same pattern; React applies this before paint and `initialized`
    // makes the condition false again on the very next render.
    if (settings && !initialized) {
        const contactSetting = settings.find((s) => s.key === SETTING_KEY)
        reset(parseContactSetting(contactSetting?.value))
        setInitialized(true)
    }

    const {fields: emailFields, append: appendEmail, remove: removeEmail} = useFieldArray({control, name: 'emails'})
    const {fields: phoneFields, append: appendPhone, remove: removePhone} = useFieldArray({control, name: 'phones'})

    function onSubmit(data: ContactFormValues) {
        const config = formToContactConfig(data)
        updateSetting.mutate(
            {key: SETTING_KEY, value: JSON.stringify(config)},
            {
                onSuccess: () => {
                    toast.success('Contact settings saved successfully')
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
        onSubmit: handleSubmit(onSubmit),
        isSaving: updateSetting.isPending,
        emailFields,
        appendEmail,
        removeEmail,
        phoneFields,
        appendPhone,
        removePhone,
    }
}
