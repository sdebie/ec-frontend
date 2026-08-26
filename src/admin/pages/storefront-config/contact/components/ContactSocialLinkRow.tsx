import {Trash2} from 'lucide-react'
import {Controller, type Control, type FieldErrors, type UseFormRegisterReturn} from 'react-hook-form'
import {InputField, RowActionButton, Select} from '@/shared/ui/components'
import type {SelectOption} from '@/shared/ui/components/form/Select'
import {SOCIAL_LINK_ICONS, type ContactFormValues} from '../hooks/useContactForm'

const ICON_LABELS: Record<(typeof SOCIAL_LINK_ICONS)[number], string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    x: 'X (Twitter)',
    youtube: 'YouTube',
    tiktok: 'TikTok',
}

const ICON_OPTIONS: SelectOption[] = SOCIAL_LINK_ICONS.map((value) => ({value, label: ICON_LABELS[value]}))

type SocialLinkRowErrors = NonNullable<FieldErrors<ContactFormValues>['socialLinks']>[number] | undefined

interface ContactSocialLinkRowProps {
    index: number
    control: Control<ContactFormValues>
    registerLabel: UseFormRegisterReturn
    registerTo: UseFormRegisterReturn
    errors: SocialLinkRowErrors
    onRemove: () => void
    canEdit: boolean
}

export function ContactSocialLinkRow({index, control, registerLabel, registerTo, errors, onRemove, canEdit}: ContactSocialLinkRowProps) {
    return (
        <tr>
            <td className="px-4 py-3 align-top">
                <InputField
                    placeholder="e.g. Facebook"
                    error={errors?.label?.message}
                    disabled={!canEdit}
                    aria-label={`Social link ${index + 1} label`}
                    {...registerLabel}
                />
            </td>
            <td className="px-4 py-3 align-top">
                <InputField
                    placeholder="https://facebook.com/yourstore"
                    error={errors?.to?.message}
                    disabled={!canEdit}
                    aria-label={`Social link ${index + 1} URL`}
                    {...registerTo}
                />
            </td>
            <td className="w-44 px-4 py-3 align-top">
                <Controller
                    control={control}
                    name={`socialLinks.${index}.icon`}
                    render={({field}) => (
                        <Select
                            options={ICON_OPTIONS}
                            value={field.value}
                            onChange={field.onChange}
                            disabled={!canEdit}
                            ariaLabel={`Social link ${index + 1} icon`}
                        />
                    )}
                />
            </td>
            {canEdit && (
                <td className="px-4 py-3 text-right align-top">
                    <RowActionButton
                        variant="danger"
                        onClick={onRemove}
                        aria-label={`Remove social link ${index + 1}`}
                    >
                        <Trash2 className="h-4 w-4"/>
                    </RowActionButton>
                </td>
            )}
        </tr>
    )
}
