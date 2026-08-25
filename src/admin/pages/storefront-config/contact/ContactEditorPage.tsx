import {Mail, Phone} from 'lucide-react'
import {PageLayout} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useContactForm} from './hooks/useContactForm'
import {ContactEnquiryFormPanel} from './components/ContactEnquiryFormPanel'
import {ContactValueListCard} from './components/ContactValueListCard'
import {ContactAdditionalInfoPanel} from './components/ContactAdditionalInfoPanel'

export function ContactEditorPage() {
    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Contact'},
    ])

    const {
        canEdit,
        isLoading,
        errors,
        register,
        onSubmit,
        isSaving,
        emailFields,
        appendEmail,
        removeEmail,
        phoneFields,
        appendPhone,
        removePhone,
    } = useContactForm()

    if (isLoading) {
        return (
            <div className="p-8 text-sm text-(--c-text-muted)">Loading contact settings...</div>
        )
    }

    const saveFooter = canEdit ? (
        <div className="flex justify-end">
            <Button type="submit" form="contact-editor-form" variant="solid" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
            </Button>
        </div>
    ) : undefined

    return (
        <PageLayout
            title="Contact Settings"
            subtitle="Configure the contact information displayed on the public Contact Us page."
            stickyFooter={saveFooter}
        >
            {/*
              noValidate is required: every row in the email/phone tables is
              always a live <input type="email"|"tel">, so a stored value that
              already fails the browser's own constraint validation (loaded
              from settings, never touched by the admin) silently blocks the
              submit event before it ever reaches react-hook-form — the zod
              validation and its error message never run, and Save appears to
              do nothing. noValidate hands all validation to zod, which is
              the only validation this form is meant to have.
            */}
            <form id="contact-editor-form" onSubmit={onSubmit} className="space-y-6" noValidate>
                <ContactEnquiryFormPanel register={register} error={errors.enquiryEmail?.message} canEdit={canEdit}/>

                <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                    <ContactValueListCard
                        icon={<Mail className="h-4 w-4"/>}
                        title="Email Addresses"
                        description="Displayed on the public Contact Us page."
                        addLabel="Add email"
                        columnLabel="Email Address"
                        fields={emailFields}
                        errors={errors.emails}
                        registerValue={(index) => register(`emails.${index}.value`)}
                        onAdd={() => appendEmail({value: ''})}
                        onRemove={removeEmail}
                        canEdit={canEdit}
                        placeholder="e.g. info@store.co.za"
                        inputType="email"
                        emptyMessage="No email addresses configured."
                    />
                    <ContactValueListCard
                        icon={<Phone className="h-4 w-4"/>}
                        title="Phone Numbers"
                        description="Displayed on the public Contact Us page."
                        addLabel="Add phone"
                        columnLabel="Phone Number"
                        fields={phoneFields}
                        errors={errors.phones}
                        registerValue={(index) => register(`phones.${index}.value`)}
                        onAdd={() => appendPhone({value: ''})}
                        onRemove={removePhone}
                        canEdit={canEdit}
                        placeholder="e.g. +27123456789"
                        inputType="tel"
                        emptyMessage="No phone numbers configured."
                    />
                </div>

                <ContactAdditionalInfoPanel
                    register={register}
                    canEdit={canEdit}
                    mapUrlError={errors.mapUrl?.message}
                    mapEmbedUrlError={errors.mapEmbedUrl?.message}
                />
            </form>
        </PageLayout>
    )
}
