import type {UseFormRegister} from 'react-hook-form'
import {Textarea} from '@/shared/ui/components'
import {ContactSectionHeading} from './ContactSectionHeading'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactLocationSectionProps {
    register: UseFormRegister<ContactFormValues>
    canEdit: boolean
}

export function ContactLocationSection({register, canEdit}: ContactLocationSectionProps) {
    return (
        <div>
            <ContactSectionHeading title="Location"/>
            <div className="max-w-2xl">
                <Textarea
                    label="Physical Address"
                    placeholder="e.g. 123 Main Street&#10;Cape Town&#10;8001"
                    rows={3}
                    disabled={!canEdit}
                    {...register('physicalAddress')}
                />
            </div>
        </div>
    )
}
