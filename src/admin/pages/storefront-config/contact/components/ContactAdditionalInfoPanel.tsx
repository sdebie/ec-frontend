import {Clock, Mail, Map as MapIcon, MapPin, Phone, PhoneCall} from 'lucide-react'
import type {FieldErrors, UseFormRegister, UseFormRegisterReturn} from 'react-hook-form'

import {InputField, Tabs, Textarea} from '@/shared/ui/components'
import {Card} from '@/shared/ui/primitives'
import {ContactPanelHeader} from './ContactPanelHeader'
import {ContactValueTable} from './ContactValueTable'
import type {ContactFormValues} from '../hooks/useContactForm'

const {TabList, TabNav, TabContent} = Tabs

interface ContactAdditionalInfoPanelProps {
    register: UseFormRegister<ContactFormValues>
    canEdit: boolean
    mapUrlError?: string
    mapEmbedUrlError?: string
    emailFields: {id: string}[]
    emailErrors: FieldErrors<ContactFormValues>['emails']
    registerEmailValue: (index: number) => UseFormRegisterReturn
    onAddEmail: () => void
    onRemoveEmail: (index: number) => void
    phoneFields: {id: string}[]
    phoneErrors: FieldErrors<ContactFormValues>['phones']
    registerPhoneValue: (index: number) => UseFormRegisterReturn
    onAddPhone: () => void
    onRemovePhone: (index: number) => void
}

/** Email addresses, phone numbers, landline, address, hours and map details — grouped into tabs so only one topic shows at a time. */
export function ContactAdditionalInfoPanel({
    register,
    canEdit,
    mapUrlError,
    mapEmbedUrlError,
    emailFields,
    emailErrors,
    registerEmailValue,
    onAddEmail,
    onRemoveEmail,
    phoneFields,
    phoneErrors,
    registerPhoneValue,
    onAddPhone,
    onRemovePhone,
}: ContactAdditionalInfoPanelProps) {
    return (
        <Card as="section" variant="bordered">
            <ContactPanelHeader
                icon={<MapPin className="h-4 w-4"/>}
                title="Additional Contact Information"
                description="Email addresses, phone numbers, landline, address, hours and map details for the public Contact Us page."
            />
            <Card.Body className="px-5 py-4">
                <Tabs defaultValue="emails">
                    <TabList>
                        <TabNav value="emails" icon={<Mail className="h-4 w-4"/>}>
                            Email Addresses
                        </TabNav>
                        <TabNav value="phones" icon={<Phone className="h-4 w-4"/>}>
                            Phone Numbers
                        </TabNav>
                        <TabNav value="general" icon={<PhoneCall className="h-4 w-4"/>}>
                            General
                        </TabNav>
                        <TabNav value="location" icon={<MapPin className="h-4 w-4"/>}>
                            Location
                        </TabNav>
                        <TabNav value="hours" icon={<Clock className="h-4 w-4"/>}>
                            Hours & Response
                        </TabNav>
                        <TabNav value="maps" icon={<MapIcon className="h-4 w-4"/>}>
                            Maps
                        </TabNav>
                    </TabList>

                    {/* max-h + overflow-y-auto so switching tabs never resizes the panel around it. */}
                    <div className="max-h-80 overflow-y-auto pt-6">
                        <TabContent value="emails">
                            <ContactValueTable
                                title="Email Addresses"
                                addLabel="Add email"
                                columnLabel="Email Address"
                                fields={emailFields}
                                errors={emailErrors}
                                registerValue={registerEmailValue}
                                onAdd={onAddEmail}
                                onRemove={onRemoveEmail}
                                canEdit={canEdit}
                                placeholder="e.g. info@store.co.za"
                                inputType="email"
                                emptyMessage="No email addresses configured."
                            />
                        </TabContent>

                        <TabContent value="phones">
                            <ContactValueTable
                                title="Phone Numbers"
                                addLabel="Add phone"
                                columnLabel="Phone Number"
                                fields={phoneFields}
                                errors={phoneErrors}
                                registerValue={registerPhoneValue}
                                onAdd={onAddPhone}
                                onRemove={onRemovePhone}
                                canEdit={canEdit}
                                placeholder="e.g. +27123456789"
                                inputType="tel"
                                emptyMessage="No phone numbers configured."
                            />
                        </TabContent>

                        <TabContent value="general">
                            <div className="max-w-2xl space-y-4">
                                <InputField
                                    label="Landline"
                                    placeholder="e.g. +27219876543"
                                    disabled={!canEdit}
                                    {...register('landline')}
                                />
                                <InputField
                                    label="WhatsApp"
                                    placeholder="e.g. +27760000000"
                                    disabled={!canEdit}
                                    {...register('whatsapp')}
                                />
                            </div>
                        </TabContent>

                        <TabContent value="location">
                            <div className="max-w-2xl">
                                <Textarea
                                    label="Physical Address"
                                    placeholder="e.g. 123 Main Street&#10;Cape Town&#10;8001"
                                    rows={3}
                                    disabled={!canEdit}
                                    {...register('physicalAddress')}
                                />
                            </div>
                        </TabContent>

                        <TabContent value="hours">
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
                        </TabContent>

                        <TabContent value="maps">
                            <div className="max-w-2xl space-y-4">
                                <InputField
                                    label="Map URL (external directions link)"
                                    placeholder="https://www.google.com/maps/place/..."
                                    helperText="Must be a valid HTTPS URL"
                                    error={mapUrlError}
                                    disabled={!canEdit}
                                    {...register('mapUrl')}
                                />
                                <InputField
                                    label="Map Embed URL"
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    helperText="Google Maps or OpenStreetMap embed URLs only"
                                    error={mapEmbedUrlError}
                                    disabled={!canEdit}
                                    {...register('mapEmbedUrl')}
                                />
                            </div>
                        </TabContent>
                    </div>
                </Tabs>
            </Card.Body>
        </Card>
    )
}
