import {Send} from 'lucide-react'
import type {UseFormRegister} from 'react-hook-form'
import {InputField} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {ContactPanelHeader} from './ContactPanelHeader'
import type {ContactFormValues} from '../hooks/useContactForm'

interface ContactEnquiryFormPanelProps {
    register: UseFormRegister<ContactFormValues>
    error?: string
    canEdit: boolean
}

/** The email that receives public storefront enquiry-form submissions. */
export function ContactEnquiryFormPanel({register, error, canEdit}: ContactEnquiryFormPanelProps) {
    return (
        <Card as="section" variant="bordered">
            <ContactPanelHeader icon={<Send className="h-4 w-4"/>} title="Enquiry Form"/>
            <Card.Body className="px-5 py-4">
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
            </Card.Body>
        </Card>
    )
}
