import type {UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import {ContactSectionHeading} from './ContactSectionHeading'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactHoursSectionProps {
    register: UseFormRegister<ContactFormValues>
    canEdit: boolean
}

export function ContactHoursSection({register, canEdit}: ContactHoursSectionProps) {
    return (
        <div>
            <ContactSectionHeading title="Hours & Response"/>
            <div className="max-w-2xl space-y-4">
                <InputField
                    label="Business Hours"
                    placeholder="e.g. Mon-Fri 08:00-17:00, Sat 09:00-13:00"
                    disabled={!canEdit}
                    {...register('businessHours')}
                />
                <InputField
                    label="Response Time"
                    placeholder="e.g. We respond within 24 hours"
                    disabled={!canEdit}
                    {...register('responseSla')}
                />
            </div>
        </div>
    )
}
