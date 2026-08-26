import type {UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import {ContactSectionHeading} from './ContactSectionHeading'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactEnquirySectionProps {
    register: UseFormRegister<ContactFormValues>
    error?: string
    canEdit: boolean
}

/** The email that receives public storefront enquiry-form submissions. */
export function ContactEnquirySection({register, error, canEdit}: ContactEnquirySectionProps) {
    return (
        <div>
            <ContactSectionHeading title="Enquiry Form"/>
            <div className="max-w-xl">
                <InputField
                    label="Enquiry recipient email"
                    placeholder="e.g. info@store.co.za"
                    helperText="The email address that receives enquiry form submissions. Leave empty to disable the enquiry form on the storefront."
                    error={error}
                    disabled={!canEdit}
                    {...register('enquiryEmail')}
                />
            </div>
        </div>
    )
}
