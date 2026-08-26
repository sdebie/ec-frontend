import type {UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import {ContactSectionHeading} from './ContactSectionHeading'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactGeneralSectionProps {
    register: UseFormRegister<ContactFormValues>
    canEdit: boolean
}

/** Direct-dial numbers: the store landline and its WhatsApp click-to-chat number. */
export function ContactGeneralSection({register, canEdit}: ContactGeneralSectionProps) {
    return (
        <div>
            <ContactSectionHeading title="General"/>
            <div className="max-w-2xl space-y-4">
                <InputField
                    label="Landline"
                    placeholder="e.g. +27219876543"
                    helperText="The direct landline number for the store."
                    disabled={!canEdit}
                    {...register('landline')}
                />
                <InputField
                    label="WhatsApp"
                    placeholder="e.g. +27760000000"
                    helperText="Used for the WhatsApp contact link shown across the storefront."
                    disabled={!canEdit}
                    {...register('whatsapp')}
                />
            </div>
        </div>
    )
}
