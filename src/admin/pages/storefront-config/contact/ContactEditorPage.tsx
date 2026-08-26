import {useState} from 'react'
import {PageLayout} from '@/shared/ui/components'
import {Button, Card} from '@/shared/ui/primitives'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {useContactForm} from './hooks/useContactForm'
import {ContactSectionNav, ContactSectionPanel} from './components/ContactSectionNav'
import type {ContactSectionKey} from './components/contactSections'
import {ContactEnquirySection} from './components/ContactEnquirySection'
import {ContactValueTable} from './components/ContactValueTable'
import {ContactGeneralSection} from './components/ContactGeneralSection'
import {ContactLocationSection} from './components/ContactLocationSection'
import {ContactHoursSection} from './components/ContactHoursSection'
import {ContactMapsSection} from './components/ContactMapsSection'
import {ContactSocialSection} from './components/ContactSocialSection'

export function ContactEditorPage() {
    useBreadcrumb([
        {label: 'Home', href: '/admin'},
        {label: 'Contact'},
    ])

    const [activeSection, setActiveSection] = useState<ContactSectionKey>('enquiry')

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
                {/*
                  Fixed height (not min/max) on md+ so every section renders at
                  the same size instead of the card growing/shrinking as the
                  admin switches between a one-field section and Social's table
                  — measured, not guessed: 68px fixed AdminHeader + 88px this
                  page's own title/subtitle block + 81px the sticky Save bar
                  reserves = 237px of chrome outside this card at any viewport
                  height. Below md the nav stacks above the content instead of
                  beside it, so a fixed height would just crowd both — left
                  auto-height there. The content column scrolls internally
                  (not the whole page) if a section ever outgrows the space.
                  e.g. an admin with many social links.
                */}
                <Card as="article" variant="panel" className="md:h-[calc(100vh-285px)]">
                    <Card.Body className="flex h-full flex-col gap-6 p-5 md:flex-row">
                        <ContactSectionNav
                            active={activeSection}
                            onSelect={setActiveSection}
                            counts={{
                                emails: emailFields.length,
                                phones: phoneFields.length,
                                social: socialFields.length,
                            }}
                        />

                        <div className="min-w-0 flex-1 md:overflow-y-auto">
                            <ContactSectionPanel sectionKey="enquiry" active={activeSection}>
                                <ContactEnquirySection register={register} error={errors.enquiryEmail?.message} canEdit={canEdit}/>
                            </ContactSectionPanel>

                            <ContactSectionPanel sectionKey="emails" active={activeSection}>
                                <ContactValueTable
                                    heading="Email Addresses"
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
                            </ContactSectionPanel>

                            <ContactSectionPanel sectionKey="phones" active={activeSection}>
                                <ContactValueTable
                                    heading="Phone Numbers"
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
                                />
                            </ContactSectionPanel>

                            <ContactSectionPanel sectionKey="general" active={activeSection}>
                                <ContactGeneralSection register={register} canEdit={canEdit}/>
                            </ContactSectionPanel>

                            <ContactSectionPanel sectionKey="location" active={activeSection}>
                                <ContactLocationSection register={register} canEdit={canEdit}/>
                            </ContactSectionPanel>

                            <ContactSectionPanel sectionKey="hours" active={activeSection}>
                                <ContactHoursSection register={register} canEdit={canEdit}/>
                            </ContactSectionPanel>

                            <ContactSectionPanel sectionKey="maps" active={activeSection}>
                                <ContactMapsSection
                                    register={register}
                                    control={control}
                                    mapUrlError={errors.mapUrl?.message}
                                    mapEmbedUrlError={errors.mapEmbedUrl?.message}
                                    canEdit={canEdit}
                                />
                            </ContactSectionPanel>

                            <ContactSectionPanel sectionKey="social" active={activeSection}>
                                <ContactSocialSection
                                    register={register}
                                    control={control}
                                    fields={socialFields}
                                    errors={errors.socialLinks}
                                    onAdd={() => appendSocial({id: crypto.randomUUID(), label: '', to: '', icon: 'facebook'})}
                                    onRemove={removeSocial}
                                    canEdit={canEdit}
                                />
                            </ContactSectionPanel>
                        </div>
                    </Card.Body>
                </Card>
            </form>
        </PageLayout>
    )
}
