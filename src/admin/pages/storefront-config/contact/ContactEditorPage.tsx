import {useState} from 'react'
import {Clock, Mail, Map as MapIcon, MapPin, Phone, Send, Share2} from 'lucide-react'
import {PageLayout, InputField, SectionTabs, type SectionTabItem} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useContactForm} from './hooks/useContactForm'
import {ContactEnquirySection} from './components/ContactEnquirySection'
import {ContactValueTable} from './components/ContactValueTable'
import {ContactLocationSection} from './components/ContactLocationSection'
import {ContactHoursSection} from './components/ContactHoursSection'
import {ContactMapsSection} from './components/ContactMapsSection'
import {ContactSocialSection} from './components/ContactSocialSection'

export function ContactEditorPage() {
    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Contact'},
    ])

    const [activeSectionId, setActiveSectionId] = useState('enquiry')

    const {
        canEdit,
        isLoading,
        errors,
        register,
        control,
        onSubmit,
        isSaving,
        emailFields,
        appendEmail,
        removeEmail,
        phoneFields,
        appendPhone,
        removePhone,
        socialFields,
        appendSocial,
        removeSocial,
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

    const sections: SectionTabItem[] = [
        {
            id: 'enquiry',
            label: 'Enquiry Form',
            icon: <Send/>,
            content: <ContactEnquirySection register={register} error={errors.enquiryEmail?.message} canEdit={canEdit}/>,
        },
        {
            id: 'emails',
            label: 'Email Addresses',
            icon: <Mail/>,
            badge: emailFields.length || undefined,
            content: (
                <ContactValueTable
                    title="Email Addresses"
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
            ),
        },
        {
            id: 'phones',
            label: 'Phone Numbers',
            icon: <Phone/>,
            badge: phoneFields.length || undefined,
            content: (
                <ContactValueTable
                    title="Phone Numbers"
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
                >
                    <InputField
                        label="Landline"
                        placeholder="e.g. +27219876543"
                        helperText="The direct landline number for the store."
                        disabled={!canEdit}
                        {...register('landline')}
                    />
                </ContactValueTable>
            ),
        },
        {
            id: 'location',
            label: 'Location',
            icon: <MapPin/>,
            content: <ContactLocationSection register={register} canEdit={canEdit}/>,
        },
        {
            id: 'hours',
            label: 'Hours & Response',
            icon: <Clock/>,
            content: <ContactHoursSection register={register} canEdit={canEdit}/>,
        },
        {
            id: 'maps',
            label: 'Maps',
            icon: <MapIcon/>,
            content: (
                <ContactMapsSection
                    register={register}
                    control={control}
                    mapUrlError={errors.mapUrl?.message}
                    mapEmbedUrlError={errors.mapEmbedUrl?.message}
                    canEdit={canEdit}
                />
            ),
        },
        {
            id: 'social',
            label: 'Social',
            icon: <Share2/>,
            description: "Links to your store's social media profiles and WhatsApp number, shown across the storefront.",
            badge: socialFields.length || undefined,
            content: (
                <ContactSocialSection
                    register={register}
                    control={control}
                    fields={socialFields}
                    errors={errors.socialLinks}
                    onAdd={() => appendSocial({id: crypto.randomUUID(), label: '', to: '', icon: 'facebook'})}
                    onRemove={removeSocial}
                    canEdit={canEdit}
                />
            ),
        },
    ]

    return (
        <PageLayout
            title="Contact Settings"
            subtitle="Configure how customers can reach and follow your store across the storefront."
            stickyFooter={saveFooter}
        >
            {/*
              noValidate is required: every row in the email/phone/social tables
              is always a live <input>, so a stored value that already fails the
              browser's own constraint validation (loaded from settings, never
              touched by the admin) silently blocks the submitted event before it
              ever reaches react-hook-form — the zod validation and its error
              message never run, and Save appears to do nothing. noValidate
              hands all validation to zod, which is the only validation this
              form is meant to have.
            */}
            <form id="contact-editor-form" onSubmit={onSubmit} noValidate>
                <SectionTabs
                    sections={sections}
                    activeSectionId={activeSectionId}
                    onActiveSectionChange={setActiveSectionId}
                />
            </form>
        </PageLayout>
    )
}
