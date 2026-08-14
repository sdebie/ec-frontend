import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'

import { useStoreSettings } from '@/admin/hooks/settings/useStoreSettings'
import { useUpdateSetting } from '@/admin/hooks/settings/useUpdateSetting'
import { useCan } from '@/shared/auth/adminPermissions'
import { isValidHttpsUrl, isApprovedMapEmbedUrl } from '@/shared/utils/contactMapUrls'
import { PageLayout, InputField, Textarea, toast } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import type { ContactConfig } from '@/shared/types/StorefrontConfig'

// --- Constants ---

const SETTING_KEY = 'storefront.contact'

// --- Schema ---

const contactSchema = z.object({
  enquiryEmail: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z.string().refine(
        (val) => val === '' || z.string().email().safeParse(val).success,
        'Must be a valid email address or empty to disable',
      ),
    ),
  emails: z.array(
    z.object({
      value: z
        .string()
        .transform((s) => s.trim())
        .pipe(z.string().email('Invalid email address')),
    }),
  ),
  phones: z.array(
    z.object({
      value: z
        .string()
        .transform((s) => s.trim())
        .pipe(z.string().min(1, 'Phone number is required')),
    }),
  ),
  landline: z.string().optional(),
  physicalAddress: z.string().optional(),
  businessHours: z.string().optional(),
  responseSla: z.string().optional(),
  mapUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidHttpsUrl(val),
      'Must be a valid HTTPS URL',
    ),
  mapEmbedUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || isApprovedMapEmbedUrl(val),
      'Must be an approved map embed URL (Google Maps or OpenStreetMap)',
    ),
})

type ContactFormValues = z.infer<typeof contactSchema>

// --- Helpers ---

function parseContactSetting(value: string | undefined): ContactFormValues {
  if (!value) return { enquiryEmail: '', emails: [], phones: [], landline: '', physicalAddress: '', businessHours: '', responseSla: '', mapUrl: '', mapEmbedUrl: '' }
  try {
    const parsed: ContactConfig = JSON.parse(value)
    return {
      enquiryEmail: parsed.enquiryEmail ?? '',
      emails: (parsed.emails ?? []).map((e) => ({ value: e })),
      phones: (parsed.phones ?? []).map((p) => ({ value: p })),
      landline: parsed.landline ?? '',
      physicalAddress: parsed.physicalAddress ?? '',
      businessHours: parsed.businessHours ?? '',
      responseSla: parsed.responseSla ?? '',
      mapUrl: parsed.mapUrl ?? '',
      mapEmbedUrl: parsed.mapEmbedUrl ?? '',
    }
  } catch {
    return { enquiryEmail: '', emails: [], phones: [], landline: '', physicalAddress: '', businessHours: '', responseSla: '', mapUrl: '', mapEmbedUrl: '' }
  }
}

function formToContactConfig(form: ContactFormValues): ContactConfig {
  const config: ContactConfig = {}
  if (form.enquiryEmail?.trim()) config.enquiryEmail = form.enquiryEmail.trim()
  const emails = form.emails.map((e) => e.value.trim()).filter(Boolean)
  if (emails.length) config.emails = emails
  const phones = form.phones.map((p) => p.value.trim()).filter(Boolean)
  if (phones.length) config.phones = phones
  if (form.landline?.trim()) config.landline = form.landline.trim()
  if (form.physicalAddress?.trim()) config.physicalAddress = form.physicalAddress.trim()
  if (form.businessHours?.trim()) config.businessHours = form.businessHours.trim()
  if (form.responseSla?.trim()) config.responseSla = form.responseSla.trim()
  if (form.mapUrl?.trim()) config.mapUrl = form.mapUrl.trim()
  if (form.mapEmbedUrl?.trim()) config.mapEmbedUrl = form.mapEmbedUrl.trim()
  return config
}

// --- Component ---

export function ContactEditorPage() {
  const canEdit = useCan('settings:write')

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Contact' },
  ])

  const { data: settings, isLoading } = useStoreSettings()
  const updateSetting = useUpdateSetting()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: parseContactSetting(undefined),
  })

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({ control, name: 'emails' })

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({ control, name: 'phones' })

  useEffect(() => {
    if (settings) {
      const contactSetting = settings.find((s) => s.key === SETTING_KEY)
      reset(parseContactSetting(contactSetting?.value))
    }
  }, [settings, reset])

  function onSubmit(data: ContactFormValues) {
    const config = formToContactConfig(data)
    updateSetting.mutate(
      { key: SETTING_KEY, value: JSON.stringify(config) },
      {
        onSuccess: () => {
          toast.success('Contact settings saved successfully')
        },
        onError: (error) => {
          console.error('[Contact] save failed:', error)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-(--c-text-muted)">Loading contact settings...</div>
    )
  }

  const headerAction = canEdit ? (
    <Button
      type="submit"
      form="contact-editor-form"
      variant="solid"
      disabled={updateSetting.isPending}
    >
      {updateSetting.isPending ? 'Saving...' : 'Save'}
    </Button>
  ) : null

  return (
    <PageLayout
      title="Contact Settings"
      subtitle="Configure the contact information displayed on the public Contact Us page."
      action={headerAction}
    >
      <form
        id="contact-editor-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl"
      >
        {/* Enquiry Recipient — distinct from the emails display list */}
        <fieldset className="space-y-2 border border-(--c-border) rounded-lg p-4">
          <legend className="text-sm font-medium text-(--c-text) px-1">Enquiry Form</legend>
          <InputField
            label="Enquiry recipient email"
            placeholder="e.g. info@store.co.za"
            helperText="The email address that receives enquiry form submissions. Leave empty to disable the enquiry form on the storefront."
            error={errors.enquiryEmail?.message}
            disabled={!canEdit}
            {...register('enquiryEmail')}
          />
        </fieldset>

        {/* Emails - repeatable list */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-(--c-text)">Email Addresses</legend>
          {emailFields.length === 0 && (
            <p className="text-sm text-(--c-text-muted)">No email addresses configured.</p>
          )}
          {emailFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <InputField
                  placeholder="e.g. info@store.co.za"
                  error={errors.emails?.[index]?.value?.message}
                  disabled={!canEdit}
                  {...register(`emails.${index}.value`)}
                />
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => removeEmail(index)}
                  className="mt-1 p-2 rounded-lg hover:bg-(--c-surface-hover) text-(--c-status-red-text)"
                  aria-label={`Remove email ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendEmail({ value: '' })}
            >
              <Plus className="w-4 h-4" />
              Add email
            </Button>
          )}
        </fieldset>

        {/* Phones - repeatable list */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-(--c-text)">Phone Numbers</legend>
          {phoneFields.length === 0 && (
            <p className="text-sm text-(--c-text-muted)">No phone numbers configured.</p>
          )}
          {phoneFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <InputField
                  placeholder="e.g. +27123456789"
                  error={errors.phones?.[index]?.value?.message}
                  disabled={!canEdit}
                  {...register(`phones.${index}.value`)}
                />
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => removePhone(index)}
                  className="mt-1 p-2 rounded-lg hover:bg-(--c-surface-hover) text-(--c-status-red-text)"
                  aria-label={`Remove phone ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendPhone({ value: '' })}
            >
              <Plus className="w-4 h-4" />
              Add phone
            </Button>
          )}
        </fieldset>

        {/* Landline */}
        <div className="space-y-1">
          <InputField
            label="Landline"
            placeholder="e.g. +27219876543"
            disabled={!canEdit}
            {...register('landline')}
          />
        </div>

        {/* Physical Address */}
        <div className="space-y-1">
          <Textarea
            label="Physical Address"
            placeholder="e.g. 123 Main Street&#10;Cape Town&#10;8001"
            rows={3}
            disabled={!canEdit}
            {...register('physicalAddress')}
          />
        </div>

        {/* Business Hours */}
        <div className="space-y-1">
          <InputField
            label="Business Hours"
            placeholder="e.g. Mon-Fri 08:00-17:00, Sat 09:00-13:00"
            disabled={!canEdit}
            {...register('businessHours')}
          />
        </div>

        {/* Response SLA */}
        <div className="space-y-1">
          <InputField
            label="Response Time"
            placeholder="e.g. We respond within 24 hours"
            disabled={!canEdit}
            {...register('responseSla')}
          />
        </div>

        {/* Map URL */}
        <div className="space-y-1">
          <InputField
            label="Map URL (external directions link)"
            placeholder="https://www.google.com/maps/place/..."
            helperText="Must be a valid HTTPS URL"
            error={errors.mapUrl?.message}
            disabled={!canEdit}
            {...register('mapUrl')}
          />
        </div>

        {/* Map Embed URL */}
        <div className="space-y-1">
          <InputField
            label="Map Embed URL"
            placeholder="https://www.google.com/maps/embed?pb=..."
            helperText="Google Maps or OpenStreetMap embed URLs only"
            error={errors.mapEmbedUrl?.message}
            disabled={!canEdit}
            {...register('mapEmbedUrl')}
          />
        </div>
      </form>
    </PageLayout>
  )
}
