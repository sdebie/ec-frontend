import { useState } from 'react'
import { ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE, Section, SectionHeading } from '@/storefront/sections/shared'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { isApprovedMapEmbedUrl, isValidHttpsUrl } from '@/shared/utils/contactMapUrls'
import { waMeUrl } from '@/shared/utils/waMeUrl'
import { useSubmitEnquiry } from './hooks/useSubmitEnquiry'
import { toast } from '@/shared/ui/components/toast'
import { InputField } from '@/shared/ui/components/form/InputField'
import { Textarea } from '@/shared/ui/components/form/Textarea'
import type { ContactConfig } from '@/shared/types/StorefrontConfig'

// --- Helpers ---

function nonBlank(values: string[] | undefined): string[] {
  return values?.filter((value) => value.trim().length > 0) ?? []
}

function toTelHref(value: string): string {
  return `tel:${value.replace(/[\s().-]/g, '')}`
}

function isValidEmail(value: string | undefined): boolean {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isContactEmpty(contact: ContactConfig | undefined): boolean {
  if (!contact) return true

  return !(
    nonBlank(contact.emails).length ||
    nonBlank(contact.phones).length ||
    contact.whatsapp?.trim() ||
    contact.landline?.trim() ||
    contact.physicalAddress?.trim() ||
    contact.businessHours?.trim() ||
    contact.responseSla?.trim() ||
    (contact.mapUrl && isValidHttpsUrl(contact.mapUrl)) ||
    (contact.mapEmbedUrl && isApprovedMapEmbedUrl(contact.mapEmbedUrl))
  )
}

// --- Form schema ---

const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address').max(254),
  phone: z.string().min(1, 'Phone number is required').max(40, 'Phone number is too long'),
  company: z.string().max(160, 'Company name is too long').optional().or(z.literal('')),
  message: z.string().min(1, 'Message is required').max(4000, 'Message is too long'),
})

type EnquiryFormValues = z.infer<typeof enquirySchema>

// --- Sub-components ---

function ContactDetail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-(--sf-text)">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-(--sf-muted-text)">{children}</dd>
    </div>
  )
}

function ContactDetailsSection({ contact }: { contact: ContactConfig }) {
  const emails = nonBlank(contact.emails)
  const phones = nonBlank(contact.phones)
  const hasWhatsApp = !!contact.whatsapp?.trim()
  const showMapLink = !!contact.mapUrl && isValidHttpsUrl(contact.mapUrl)

  return (
    <div>
      {/* Column heading — the page title is the shared SectionHeading h1 above
          the panel, so this is an h2 carrying the same treatment as the form
          column's "Send us a message" beside it. */}
      <h2 className="text-lg font-semibold text-(--sf-text)">Get in touch</h2>
      <p className="mt-1 mb-6 text-sm text-(--sf-muted-text)">
        We are here to help with product enquiries, orders, and general questions.
      </p>

      <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {contact.physicalAddress?.trim() && (
          <ContactDetail label="Address">
            <span className="whitespace-pre-line">{contact.physicalAddress}</span>
          </ContactDetail>
        )}

        {phones.length > 0 && (
          <ContactDetail label={hasWhatsApp ? 'Phone' : 'Call / WhatsApp'}>
            <span className="flex flex-col items-start gap-1">
              {phones.map((phone) => (
                <a
                  key={phone}
                  href={toTelHref(phone)}
                  className="underline decoration-current/50 underline-offset-4 hover:opacity-75"
                >
                  {phone}
                </a>
              ))}
            </span>
          </ContactDetail>
        )}

        {hasWhatsApp && (
          <ContactDetail label="WhatsApp">
            <a
              href={waMeUrl(contact.whatsapp!)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-current/50 underline-offset-4 hover:opacity-75"
            >
              {contact.whatsapp}
            </a>
          </ContactDetail>
        )}

        {contact.landline?.trim() && (
          <ContactDetail label="Landline">
            <a
              href={toTelHref(contact.landline)}
              className="underline decoration-current/50 underline-offset-4 hover:opacity-75"
            >
              {contact.landline}
            </a>
          </ContactDetail>
        )}

        {emails.length > 0 && (
          <ContactDetail label="Email">
            <span className="flex flex-col items-start gap-1">
              {/* Keyed by position: this list is operator-editable config and may
                  legitimately repeat a value, which a value-key cannot survive. */}
              {emails.map((email, index) => (
                <a
                  key={index}
                  href={`mailto:${email}`}
                  className="break-all underline decoration-current/50 underline-offset-4 hover:opacity-75"
                >
                  {email}
                </a>
              ))}
            </span>
          </ContactDetail>
        )}

        {contact.businessHours?.trim() && (
          <ContactDetail label="Business hours">{contact.businessHours}</ContactDetail>
        )}
        {contact.responseSla?.trim() && (
          <ContactDetail label="Response time">{contact.responseSla}</ContactDetail>
        )}
        {showMapLink && (
          <ContactDetail label="Directions">
            <a
              href={contact.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-current/50 underline-offset-4 hover:opacity-75"
            >
              Get directions
            </a>
          </ContactDetail>
        )}
      </dl>
    </div>
  )
}

function EnquiryForm() {
  const { mutate, isPending } = useSubmitEnquiry()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    mode: 'onTouched',
  })

  function onSubmit(data: EnquiryFormValues) {
    const honeypotInput = document.getElementById('website') as HTMLInputElement | null
    const honeypotValue = honeypotInput?.value ?? ''

    mutate(
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company || undefined,
        message: data.message,
        website: honeypotValue || undefined,
      },
      {
        onSuccess: () => {
          setSubmitted(true)
          reset()
        },
        onError: (error) => {
          const axiosError = error as { response?: { status?: number } }
          if (axiosError.response?.status === 429) {
            toast.error('Too many attempts. Please try again later.')
          } else {
            toast.error('Something went wrong. Please try again.')
          }
        },
      }
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-(--sf-accent)/10 p-3">
          <svg className="h-8 w-8 text-(--sf-accent)" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-(--sf-text)">Message sent</h3>
        <p className="mt-2 text-sm text-(--sf-muted-text)">
          Thank you for your enquiry. We'll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-(--sf-accent) hover:opacity-80"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot — hidden from real users and assistive tech */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Name */}
      <div>
        <InputField
          id="enquiry-name"
          type="text"
          autoComplete="name"
          label="Name"
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      {/* Email */}
      <div>
        <InputField
          id="enquiry-email"
          type="email"
          autoComplete="email"
          label="Email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {/* Phone */}
      <div>
        <InputField
          id="enquiry-phone"
          type="tel"
          autoComplete="tel"
          required
          // This form marks no field with an asterisk; only `phone` carries the
          // HTML attribute (Req 4.5), so an indicator here alone misreads.
          showRequiredIndicator={false}
          label="Phone"
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      {/* Company (optional) */}
      <div>
        <InputField
          id="enquiry-company"
          type="text"
          autoComplete="organization"
          label={
            <>
              Company <span className="text-(--sf-muted-text)">(optional)</span>
            </>
          }
          error={errors.company?.message}
          {...register('company')}
        />
      </div>

      {/* Message */}
      <div>
        <Textarea
          id="enquiry-message"
          rows={5}
          className="resize-y"
          label="Message"
          error={errors.message?.message}
          {...register('message')}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={`flex w-full items-center justify-center rounded-md bg-(--sf-accent) px-4 py-2.5 text-sm font-medium text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}

// --- Main page component ---

export function ContactUsPage() {
  const { contact } = useStorefrontConfig()

  // The heading is present in EVERY state, so the empty state renders it too —
  // the same rule CartPage and WishlistPage follow.
  const heading = (
    <>
      <SectionHeading as="h1" title="Contact Us" className="mb-4" />
      <div className="mb-6 border-t border-(--sf-border)" />
    </>
  )

  if (isContactEmpty(contact)) {
    return (
      <Section as="div" width="wide">
        {heading}
        <div className="rounded-lg border border-(--sf-border) bg-(--sf-panel) px-6 py-16 text-center">
          <p className="text-sm text-(--sf-muted-text)">Contact information coming soon</p>
        </div>
      </Section>
    )
  }

  const showForm = isValidEmail(contact?.enquiryEmail)
  const showMapEmbed = !!contact?.mapEmbedUrl && isApprovedMapEmbedUrl(contact.mapEmbedUrl)

  // Determine grid layout: form gets its own column when present. The middle
  // track is the rule ITSELF — see the comment on the rule cell below.
  const hasRightColumn = showForm || showMapEmbed

  return (
    <Section as="div" width="wide">
      {heading}

      <div className="overflow-hidden rounded-lg border border-(--sf-border) bg-(--sf-panel)">
        <div className={hasRightColumn ? 'grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr]' : ''}>
          {/* Left: contact details */}
          <section className="p-5 lg:p-6">
            <ContactDetailsSection contact={contact!} />
          </section>

          {/* The rule is its own grid CELL rather than a border on the right
              column, so it can be inset from the container's edges — a border
              runs the full height and cannot carry margins. Same treatment as
              the product detail page's gallery/purchase split. Below lg it
              reflows to a horizontal rule without a second layout. */}
          {hasRightColumn && (
            <div
              aria-hidden="true"
              className="mx-5 h-px bg-(--sf-border) lg:mx-0 lg:my-6 lg:h-auto lg:w-px"
            />
          )}

          {/* Right: form or map */}
          {showForm && (
            <section className="p-5 lg:p-6">
              <h2 className="text-lg font-semibold text-(--sf-text)">Send us a message</h2>
              <p className="mt-1 mb-6 text-sm text-(--sf-muted-text)">
                Fill in the form below and we'll get back to you.
              </p>
              <EnquiryForm />
            </section>
          )}

          {!showForm && showMapEmbed && (
            <section className="min-h-80">
              <iframe
                src={contact!.mapEmbedUrl}
                title="Map location"
                className="size-full min-h-80 border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </section>
          )}
        </div>

        {/* Map embed below the main content when form is shown. This rule spans
            the full width because the iframe is full-bleed — an inset rule
            would leave the map's edge floating past it. */}
        {showForm && showMapEmbed && (
          <section className="min-h-80 border-t border-(--sf-border)">
            <iframe
              src={contact!.mapEmbedUrl}
              title="Map location"
              className="size-full min-h-80 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        )}
      </div>
    </Section>
  )
}
