import {PageLayout} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useContactForm} from './hooks/useContactForm'
import {ContactEnquiryFormPanel} from './components/ContactEnquiryFormPanel'
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

                <ContactAdditionalInfoPanel
                    register={register}
                    canEdit={canEdit}
                    mapUrlError={errors.mapUrl?.message}
                    mapEmbedUrlError={errors.mapEmbedUrl?.message}
                    emailFields={emailFields}
                    emailErrors={errors.emails}
                    registerEmailValue={(index) => register(`emails.${index}.value`)}
                    onAddEmail={() => appendEmail({value: ''})}
                    onRemoveEmail={removeEmail}
                    phoneFields={phoneFields}
                    phoneErrors={errors.phones}
                    registerPhoneValue={(index) => register(`phones.${index}.value`)}
                    onAddPhone={() => appendPhone({value: ''})}
                    onRemovePhone={removePhone}
                />
            </form>
        </PageLayout>
    )
}
