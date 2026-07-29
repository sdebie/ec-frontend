import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useQuoteStore } from '../quoteStore'
import { useSubmitQuoteRequest } from '../hooks/useSubmitQuoteRequest'

// --- Zod schema ---

const quoteDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254),
  phone: z.string().max(40, 'Phone number is too long').optional().or(z.literal('')),
  company: z.string().max(160, 'Company name is too long').optional().or(z.literal('')),
  message: z.string().max(4000, 'Message is too long').optional().or(z.literal('')),
  website: z.string().optional(), // honeypot
})

type QuoteDetailsFormValues = z.infer<typeof quoteDetailsSchema>

interface QuoteDetailsFormProps {
  onSuccess: () => void
}

/**
 * QuoteDetailsForm — contact form for quote request submission.
 * react-hook-form + zod. Includes off-screen honeypot field.
 * Submit button gated on: form valid AND quote list non-empty.
 */
export function QuoteDetailsForm({ onSuccess }: QuoteDetailsFormProps) {
  const items = useQuoteStore((s) => s.items)
  const { mutate, isPending } = useSubmitQuoteRequest()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<QuoteDetailsFormValues>({
    resolver: zodResolver(quoteDetailsSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      website: '',
    },
  })

  const isListEmpty = items.length === 0
  const isSubmitDisabled = !isValid || isListEmpty || isPending

  function onSubmit(data: QuoteDetailsFormValues) {
    mutate(
      {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        company: data.company || undefined,
        message: data.message || undefined,
        website: data.website || undefined,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          onSuccess()
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Honeypot — positioned off-screen, NOT display:none (must be in DOM payload) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          opacity: 0,
          height: 0,
          overflow: 'hidden',
        }}
      >
        <label htmlFor="quote-website">Website</label>
        <input
          type="text"
          id="quote-website"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="quote-name" className="block text-sm font-medium text-(--sf-text)">
          Name
        </label>
        <input
          id="quote-name"
          type="text"
          autoComplete="name"
          aria-describedby={errors.name ? 'quote-name-error' : undefined}
          aria-invalid={!!errors.name}
          className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('name')}
        />
        {errors.name && (
          <p id="quote-name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="quote-email" className="block text-sm font-medium text-(--sf-text)">
          Email
        </label>
        <input
          id="quote-email"
          type="email"
          autoComplete="email"
          aria-describedby={errors.email ? 'quote-email-error' : undefined}
          aria-invalid={!!errors.email}
          className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('email')}
        />
        {errors.email && (
          <p id="quote-email-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone (optional) */}
      <div>
        <label htmlFor="quote-phone" className="block text-sm font-medium text-(--sf-text)">
          Phone <span className="text-(--sf-muted-text)">(optional)</span>
        </label>
        <input
          id="quote-phone"
          type="tel"
          autoComplete="tel"
          className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('phone')}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Company (optional) */}
      <div>
        <label htmlFor="quote-company" className="block text-sm font-medium text-(--sf-text)">
          Company <span className="text-(--sf-muted-text)">(optional)</span>
        </label>
        <input
          id="quote-company"
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

      {/* Message (optional, textarea) */}
      <div>
        <label htmlFor="quote-message" className="block text-sm font-medium text-(--sf-text)">
          Message <span className="text-(--sf-muted-text)">(optional)</span>
        </label>
        <textarea
          id="quote-message"
          rows={4}
          className="mt-1 block w-full resize-y rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          {...register('message')}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="flex w-full items-center justify-center rounded-md bg-(--sf-accent) px-4 py-2.5 text-sm font-medium text-(--sf-accent-text) shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--sf-ring) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Submitting…' : 'Request quote'}
      </button>

      {isListEmpty && (
        <p className="text-center text-xs text-(--sf-muted-text)">
          Add at least one product to your quote list before submitting.
        </p>
      )}
    </form>
  )
}
