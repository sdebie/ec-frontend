import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { isApprovedMapEmbedUrl, isValidHttpsUrl } from '@/shared/utils/contactMapUrls'
import { useSubmitEnquiry } from './hooks/useSubmitEnquiry'
import { toast } from '@/shared/ui/components/toast'
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
  const showMapLink = !!contact.mapUrl && isValidHttpsUrl(contact.mapUrl)

  return (
    <div className="relative">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--sf-muted-text)">Contact</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-(--sf-text) sm:text-4xl">Get in touch</h1>
      <p className="mt-4 max-w-md text-base leading-7 text-(--sf-muted-text)">
        We are here to help with product enquiries, orders, and general questions.
      </p>

      <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {contact.physicalAddress?.trim() && (
          <ContactDetail label="Address">
            <span className="whitespace-pre-line">{contact.physicalAddress}</span>
          </ContactDetail>
        )}

        {phones.length > 0 && (
          <ContactDetail label="Call / WhatsApp">
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
              {emails.map((email) => (
                <a
                  key={email}
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
        <label htmlFor="enquiry-name" className="block text-sm font-medium text-(--sf-text)">
          Name
        </label>
        <input
          id="enquiry-name"
          type="text"
          autoComplete="name"
          aria-describedby={errors.name ? 'enquiry-name-error' : undefined}
          aria-invalid={!!errors.name}
          className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('name')}
        />
        {errors.name && (
          <p id="enquiry-name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="enquiry-email" className="block text-sm font-medium text-(--sf-text)">
          Email
        </label>
        <input
          id="enquiry-email"
          type="email"
          autoComplete="email"
          aria-describedby={errors.email ? 'enquiry-email-error' : undefined}
          aria-invalid={!!errors.email}
          className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('email')}
        />
        {errors.email && (
          <p id="enquiry-email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="enquiry-phone" className="block text-sm font-medium text-(--sf-text)">
          Phone
        </label>
        <input
          id="enquiry-phone"
          type="tel"
          autoComplete="tel"
          required
          aria-describedby={errors.phone ? 'enquiry-phone-error' : undefined}
          aria-invalid={!!errors.phone}
          className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('phone')}
        />
        {errors.phone && (
          <p id="enquiry-phone-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Company (optional) */}
      <div>
        <label htmlFor="enquiry-company" className="block text-sm font-medium text-(--sf-text)">
          Company <span className="text-(--sf-muted-text)">(optional)</span>
        </label>
        <input
          id="enquiry-company"
          type="text"
          autoComplete="organization"
          className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('company')}
        />
        {errors.company && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.company.message}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="enquiry-message" className="block text-sm font-medium text-(--sf-text)">
          Message
        </label>
        <textarea
          id="enquiry-message"
          rows={5}
          aria-describedby={errors.message ? 'enquiry-message-error' : undefined}
          aria-invalid={!!errors.message}
          className="mt-1 block w-full resize-y rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('message')}
        />
        {errors.message && (
          <p id="enquiry-message-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-md bg-(--sf-accent) px-4 py-2.5 text-sm font-medium text-(--sf-accent-text) shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--sf-ring) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

  if (isContactEmpty(contact)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-sm text-(--sf-muted-text)">Contact information coming soon</p>
      </div>
    )
  }

  const showForm = isValidEmail(contact?.enquiryEmail)
  const showMapEmbed = !!contact?.mapEmbedUrl && isApprovedMapEmbedUrl(contact.mapEmbedUrl)

  // Determine grid layout: form gets its own column when present
  const hasRightColumn = showForm || showMapEmbed

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="overflow-hidden rounded-2xl border border-(--sf-border) bg-(--sf-panel) shadow-(--sf-shadow-lg)">
        <div className={hasRightColumn ? 'grid lg:grid-cols-2' : ''}>
          {/* Left: contact details */}
          <section className="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 size-64 rounded-full border border-(--sf-accent-text) opacity-15"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-28 -left-24 size-72 rounded-full border border-(--sf-accent-text) opacity-10"
            />
            <ContactDetailsSection contact={contact!} />
          </section>

          {/* Right: form or map */}
          {showForm && (
            <section className="border-t border-(--sf-border) px-6 py-10 sm:px-10 sm:py-12 lg:border-l lg:border-t-0">
              <h2 className="text-lg font-semibold text-(--sf-text)">Send us a message</h2>
              <p className="mt-1 mb-6 text-sm text-(--sf-muted-text)">
                Fill in the form below and we'll get back to you.
              </p>
              <EnquiryForm />
            </section>
          )}

          {!showForm && showMapEmbed && (
            <section className="min-h-80 border-t border-(--sf-border) lg:border-l lg:border-t-0">
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

        {/* Map embed below the main content when form is shown */}
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
    </main>
  )
}
