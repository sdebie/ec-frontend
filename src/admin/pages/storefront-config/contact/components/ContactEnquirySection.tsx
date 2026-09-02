import type {UseFormRegister} from 'react-hook-form'
import {Alert, InputField} from '@/shared/ui/components'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactEnquirySectionProps {
    register: UseFormRegister<ContactFormValues>
    error?: string
    canEdit: boolean
}

/** The email that receives public storefront enquiry-form submissions. */
export function ContactEnquirySection({register, error, canEdit}: ContactEnquirySectionProps) {
    return (
        <div className="space-y-4">
            <Alert
                title="The email address that receives enquiry form submissions."
                description="Leave empty to disable the enquiry form on the storefront."
            />
            <InputField
                label="Enquiry recipient email"
                placeholder="e.g. info@store.co.za"
                error={error}
                disabled={!canEdit}
                {...register('enquiryEmail')}
            />
        </div>
    )
}
