import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  wholesaleApplicationSchema,
  type WholesaleApplicationFormInput,
  type WholesaleApplicationFormValues,
} from './wholesaleApplicationSchema'
import { useWholesaleApplicationSubmit } from './useWholesaleApplicationSubmit'
import { toDto } from './mappers'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SectionProps {
  form: UseFormReturn<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>
}

interface PostalSectionProps extends SectionProps {
  sameAsPhysical: boolean
}

// ---------------------------------------------------------------------------
// SuccessCard
// ---------------------------------------------------------------------------

function SuccessCard() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-(--sf-text)">Application submitted</h2>
        <p className="mt-3 text-(--sf-muted-text)">
          Thank you. Your wholesale application has been received. We will review your details and
          contact you within 2–3 business days.
        </p>
        <p className="mt-2 text-sm text-(--sf-muted-text)">
          Once approved, you will receive an email with a link to set your password and access your
          wholesale account.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-(--sf-accent) px-5 py-2.5 text-sm font-medium text-(--sf-accent-text) hover:opacity-90"
        >
          Return to home
        </Link>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ApplicantSection
// ---------------------------------------------------------------------------

function ApplicantSection({ form }: SectionProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Applicant Details</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-(--sf-text)">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            {...register('firstName')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-(--sf-text)">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            {...register('lastName')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-(--sf-text)">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-(--sf-text)">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// CompanySection
// ---------------------------------------------------------------------------

function CompanySection({ form }: SectionProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Company Details</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-(--sf-text)">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            type="text"
            {...register('companyName')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="vatNumber" className="block text-sm font-medium text-(--sf-text)">
            VAT Number
          </label>
          <input
            id="vatNumber"
            type="text"
            {...register('vatNumber')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.vatNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.vatNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="regNumber" className="block text-sm font-medium text-(--sf-text)">
            Registration Number <span className="text-red-500">*</span>
          </label>
          <input
            id="regNumber"
            type="text"
            {...register('regNumber')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.regNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.regNumber.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// PhysicalAddressSection
// ---------------------------------------------------------------------------

function PhysicalAddressSection({ form }: SectionProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Physical Address</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="physicalAddressLine1" className="block text-sm font-medium text-(--sf-text)">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            id="physicalAddressLine1"
            type="text"
            {...register('physicalAddressLine1')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.physicalAddressLine1 && (
            <p className="mt-1 text-sm text-red-600">{errors.physicalAddressLine1.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="physicalAddressLine2" className="block text-sm font-medium text-(--sf-text)">
            Address Line 2
          </label>
          <input
            id="physicalAddressLine2"
            type="text"
            {...register('physicalAddressLine2')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="physicalSuburb" className="block text-sm font-medium text-(--sf-text)">
            Suburb <span className="text-red-500">*</span>
          </label>
          <input
            id="physicalSuburb"
            type="text"
            {...register('physicalSuburb')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.physicalSuburb && (
            <p className="mt-1 text-sm text-red-600">{errors.physicalSuburb.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="physicalCity" className="block text-sm font-medium text-(--sf-text)">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="physicalCity"
            type="text"
            {...register('physicalCity')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.physicalCity && (
            <p className="mt-1 text-sm text-red-600">{errors.physicalCity.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="physicalProvince" className="block text-sm font-medium text-(--sf-text)">
            Province <span className="text-red-500">*</span>
          </label>
          <input
            id="physicalProvince"
            type="text"
            {...register('physicalProvince')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.physicalProvince && (
            <p className="mt-1 text-sm text-red-600">{errors.physicalProvince.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="physicalPostalCode" className="block text-sm font-medium text-(--sf-text)">
            Postal Code <span className="text-red-500">*</span>
          </label>
          <input
            id="physicalPostalCode"
            type="text"
            {...register('physicalPostalCode')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          />
          {errors.physicalPostalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.physicalPostalCode.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// PostalAddressSection
// ---------------------------------------------------------------------------

function PostalAddressSection({ form, sameAsPhysical }: PostalSectionProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Postal Address</h2>

      <label className="mb-4 flex items-center gap-2 text-sm text-(--sf-text)">
        <input
          type="checkbox"
          {...register('sameAsPhysical')}
          className="h-4 w-4 rounded border-(--sf-border) accent-(--sf-accent) focus:ring-(--sf-ring)"
        />
        Same as physical address
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="postalAddressLine1" className="block text-sm font-medium text-(--sf-text)">
            Address Line 1
          </label>
          <input
            id="postalAddressLine1"
            type="text"
            disabled={sameAsPhysical}
            {...register('postalAddressLine1')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none disabled:cursor-not-allowed disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
          />
          {errors.postalAddressLine1 && (
            <p className="mt-1 text-sm text-red-600">{errors.postalAddressLine1.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="postalAddressLine2" className="block text-sm font-medium text-(--sf-text)">
            Address Line 2
          </label>
          <input
            id="postalAddressLine2"
            type="text"
            disabled={sameAsPhysical}
            {...register('postalAddressLine2')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none disabled:cursor-not-allowed disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
          />
        </div>

        <div>
          <label htmlFor="postalSuburb" className="block text-sm font-medium text-(--sf-text)">
            Suburb
          </label>
          <input
            id="postalSuburb"
            type="text"
            disabled={sameAsPhysical}
            {...register('postalSuburb')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none disabled:cursor-not-allowed disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
          />
          {errors.postalSuburb && (
            <p className="mt-1 text-sm text-red-600">{errors.postalSuburb.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="postalCity" className="block text-sm font-medium text-(--sf-text)">
            City
          </label>
          <input
            id="postalCity"
            type="text"
            disabled={sameAsPhysical}
            {...register('postalCity')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none disabled:cursor-not-allowed disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
          />
          {errors.postalCity && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCity.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="postalProvince" className="block text-sm font-medium text-(--sf-text)">
            Province
          </label>
          <input
            id="postalProvince"
            type="text"
            disabled={sameAsPhysical}
            {...register('postalProvince')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none disabled:cursor-not-allowed disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
          />
          {errors.postalProvince && (
            <p className="mt-1 text-sm text-red-600">{errors.postalProvince.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="postalPostalCode" className="block text-sm font-medium text-(--sf-text)">
            Postal Code
          </label>
          <input
            id="postalPostalCode"
            type="text"
            disabled={sameAsPhysical}
            {...register('postalPostalCode')}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none disabled:cursor-not-allowed disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
          />
          {errors.postalPostalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalPostalCode.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// NotesSection
// ---------------------------------------------------------------------------

function NotesSection({ form }: SectionProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <section className="rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-(--sf-text)">Additional Notes</h2>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-(--sf-text)">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          {...register('notes')}
          className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-accent) focus:ring-1 focus:ring-(--sf-ring) focus:outline-none"
          placeholder="Tell us about your business, expected order volumes, or any other relevant details..."
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
        <p className="mt-1 text-xs text-(--sf-muted-text)">Maximum 1000 characters</p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// WholesaleApplicationPage
// ---------------------------------------------------------------------------

export function WholesaleApplicationPage() {
  const [submitted, setSubmitted] = useState(false)
  const { mutate, isPending } = useWholesaleApplicationSubmit()
  const form = useForm<WholesaleApplicationFormInput, unknown, WholesaleApplicationFormValues>({
    resolver: zodResolver(wholesaleApplicationSchema),
    mode: 'onTouched',
    defaultValues: { sameAsPhysical: false },
  })
  const sameAsPhysical = form.watch('sameAsPhysical') ?? false

  if (submitted) return <SuccessCard />

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--sf-text)">Wholesale Application</h1>
        <p className="mt-2 text-(--sf-muted-text)">
          Complete the form below to apply for a wholesale account. We'll review your application
          and get back to you within 2–3 business days.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(
          (values) => mutate(toDto(values), { onSuccess: () => setSubmitted(true) }),
          (errors) => {
            const firstErrorKey = Object.keys(errors)[0]
            if (firstErrorKey) {
              const element = document.querySelector(`[name="${firstErrorKey}"]`)
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }
        )}
        noValidate
        className="space-y-6"
      >
        <ApplicantSection form={form} />
        <CompanySection form={form} />
        <PhysicalAddressSection form={form} />
        <PostalAddressSection form={form} sameAsPhysical={sameAsPhysical} />
        <NotesSection form={form} />

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-(--sf-accent) px-6 py-3 text-sm font-medium text-(--sf-accent-text) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
