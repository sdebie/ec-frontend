import {useState} from 'react'
import {toast} from '@/shared/ui/components'
import {useStoreSettings} from '@/admin/hooks/settings/useStoreSettings'
import {useUpdateSetting} from '@/admin/hooks/settings/useUpdateSetting'
import type {StoreSetting} from '@/admin/hooks/settings/types'

export interface AnnouncementFormValues {
    enabled: boolean
    text: string
    backgroundColor: string
    textColor: string
    showContact: boolean
    showSocial: boolean
}

const SETTING_KEY = 'storefront.header'

export const DEFAULT_ANNOUNCEMENT_VALUES: AnnouncementFormValues = {
    enabled: false,
    text: '',
    backgroundColor: '#1a1f35',
    textColor: '#ffffff',
    showContact: false,
    showSocial: false,
}

function parseHeaderSetting(settings: StoreSetting[]): AnnouncementFormValues {
    const row = settings.find((s) => s.key === SETTING_KEY)
    if (!row) return DEFAULT_ANNOUNCEMENT_VALUES

    try {
        const parsed = JSON.parse(row.value)
        const ann = parsed?.announcement
        if (!ann) return DEFAULT_ANNOUNCEMENT_VALUES

        return {
            enabled: ann.enabled ?? false,
            text: ann.text ?? '',
            backgroundColor: ann.backgroundColor || '#1a1f35',
            textColor: ann.textColor || '#ffffff',
            showContact: ann.showContact ?? false,
            showSocial: ann.showSocial ?? false,
        }
    } catch {
        return DEFAULT_ANNOUNCEMENT_VALUES
    }
}

/**
 * Owns the announcement settings form: loading the persisted
 * `storefront.header` setting, local draft state, and saving it back.
 * Preview-specific data (Contact/Social settings) lives in
 * `useAnnouncementPreview` instead — this hook knows nothing about rendering.
 */
export function useAnnouncementForm() {
    const {data: settings, isLoading, isError} = useStoreSettings()
    const updateSetting = useUpdateSetting()

    const [form, setForm] = useState<AnnouncementFormValues>(DEFAULT_ANNOUNCEMENT_VALUES)
    const [initialized, setInitialized] = useState(false)

    if (settings && !initialized) {
        setForm(parseHeaderSetting(settings))
        setInitialized(true)
    }

    function handleSave() {
        const payload = JSON.stringify({
            announcement: {
                enabled: form.enabled,
                text: form.text,
                backgroundColor: form.backgroundColor,
                textColor: form.textColor,
                showContact: form.showContact,
                showSocial: form.showSocial,
            },
        })
        updateSetting.mutate(
            {key: SETTING_KEY, value: payload},
            {onSuccess: () => toast.success('Announcement settings saved')},
        )
    }

    return {
        form,
        setForm,
        isLoading,
        isError,
        handleSave,
        isSaving: updateSetting.isPending,
    }
}
