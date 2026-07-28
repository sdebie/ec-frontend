import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useQuoteStore } from '../quoteStore'
import { useSubmitQuoteRequest } from '../hooks/useSubmitQuoteRequest'
import { InputField } from '@/shared/ui/components/form/InputField'
import { Textarea } from '@/shared/ui/components/form/Textarea'

/** Muted "(optional)" suffix used on the non-required field labels. */
function OptionalLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children} <span className="text-(--sf-muted-text)">(optional)</span>
    </>
  )
}

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
        <InputField
          id="quote-name"
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
          id="quote-email"
          type="email"
          autoComplete="email"
          label="Email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {/* Phone (optional) */}
      <div>
        <InputField
          id="quote-phone"
          type="tel"
          autoComplete="tel"
          label={<OptionalLabel>Phone</OptionalLabel>}
          error={errors.phone?.message}
          {...register('phone')}
        />
      </div>

      {/* Company (optional) */}
      <div>
        <InputField
          id="quote-company"
          type="text"
          autoComplete="organization"
          label={<OptionalLabel>Company</OptionalLabel>}
          error={errors.company?.message}
          {...register('company')}
        />
      </div>

      {/* Message (optional, textarea) */}
      <div>
        <Textarea
          id="quote-message"
          rows={4}
          className="resize-y"
          label={<OptionalLabel>Message</OptionalLabel>}
          error={errors.message?.message}
          {...register('message')}
        />
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
