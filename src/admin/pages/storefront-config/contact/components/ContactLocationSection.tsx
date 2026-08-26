import type {UseFormRegister} from 'react-hook-form'
import {Textarea} from '@/shared/ui/components'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactLocationSectionProps {
    register: UseFormRegister<ContactFormValues>
    canEdit: boolean
}

export function ContactLocationSection({register, canEdit}: ContactLocationSectionProps) {
    return (
        <Textarea
            label="Physical Address"
            placeholder="e.g. 123 Main Street&#10;Cape Town&#10;8001"
            rows={3}
            disabled={!canEdit}
            {...register('physicalAddress')}
        />
    )
}
