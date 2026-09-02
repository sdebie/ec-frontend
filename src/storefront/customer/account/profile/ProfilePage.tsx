import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useCustomerProfile } from '../hooks/useCustomerProfile'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { useChangePassword } from '../hooks/useChangePassword'
import { InputField } from '@/shared/ui/components/form/InputField'
import { PasswordField } from '@/shared/ui/components/form/PasswordField'
import { ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE } from '@/storefront/sections/shared'
import type { AxiosError } from 'axios'
import type { UpdateProfileRequest } from '../types'

const phoneRegex = /^(\+?\d[\d\s\-()]{6,})$/

/** Muted "(optional)" suffix used on the non-required field labels. */
function OptionalLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children} <span className="text-(--sf-muted-text)">(optional)</span>
    </>
  )
}

/** Postal fields are disabled while they mirror the physical address. */
const DISABLED_CLASSES = 'disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)'

const profileSchema = z.object({
  firstName: z.string().min(1, 'This field is required'),
  lastName: z.string().min(1, 'This field is required'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Enter a valid phone number',
    }),
  physicalLine1: z.string().optional(),
  physicalLine2: z.string().optional(),
  physicalSuburb: z.string().optional(),
  physicalCity: z.string().optional(),
  physicalProvince: z.string().optional(),
  physicalPostalCode: z.string().optional(),
  postalLine1: z.string().optional(),
  postalLine2: z.string().optional(),
  postalSuburb: z.string().optional(),
  postalCity: z.string().optional(),
  postalProvince: z.string().optional(),
  postalPostalCode: z.string().optional(),
  postalSameAsPhysical: z.boolean().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { data: profile, isLoading } = useCustomerProfile()
  const updateProfile = useUpdateProfile()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      physicalLine1: '',
      physicalLine2: '',
      physicalSuburb: '',
      physicalCity: '',
      physicalProvince: '',
      physicalPostalCode: '',
      postalLine1: '',
      postalLine2: '',
      postalSuburb: '',
      postalCity: '',
      postalProvince: '',
      postalPostalCode: '',
      postalSameAsPhysical: false,
    },
  })

  const postalSameAsPhysical = watch('postalSameAsPhysical')
  const physicalLine1 = watch('physicalLine1')
  const physicalLine2 = watch('physicalLine2')
  const physicalSuburb = watch('physicalSuburb')
  const physicalCity = watch('physicalCity')
  const physicalProvince = watch('physicalProvince')
  const physicalPostalCode = watch('physicalPostalCode')

  // Pre-populate form when profile loads
  useEffect(() => {
    if (profile) {
      const isSameAddress =
        profile.physicalAddress != null &&
        profile.postalAddress != null &&
        profile.physicalAddress.line1 === profile.postalAddress.line1 &&
        profile.physicalAddress.line2 === profile.postalAddress.line2 &&
        profile.physicalAddress.suburb === profile.postalAddress.suburb &&
        profile.physicalAddress.city === profile.postalAddress.city &&
        profile.physicalAddress.province === profile.postalAddress.province &&
        profile.physicalAddress.postalCode === profile.postalAddress.postalCode

      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone ?? '',
        physicalLine1: profile.physicalAddress?.line1 ?? '',
        physicalLine2: profile.physicalAddress?.line2 ?? '',
        physicalSuburb: profile.physicalAddress?.suburb ?? '',
        physicalCity: profile.physicalAddress?.city ?? '',
        physicalProvince: profile.physicalAddress?.province ?? '',
        physicalPostalCode: profile.physicalAddress?.postalCode ?? '',
        postalLine1: profile.postalAddress?.line1 ?? '',
        postalLine2: profile.postalAddress?.line2 ?? '',
        postalSuburb: profile.postalAddress?.suburb ?? '',
        postalCity: profile.postalAddress?.city ?? '',
        postalProvince: profile.postalAddress?.province ?? '',
        postalPostalCode: profile.postalAddress?.postalCode ?? '',
        postalSameAsPhysical: isSameAddress,
      })
    }
  }, [profile, reset])

  // Copy physical address to postal when checkbox is checked
  useEffect(() => {
    if (postalSameAsPhysical) {
      setValue('postalLine1', physicalLine1 ?? '')
      setValue('postalLine2', physicalLine2 ?? '')
      setValue('postalSuburb', physicalSuburb ?? '')
      setValue('postalCity', physicalCity ?? '')
      setValue('postalProvince', physicalProvince ?? '')
      setValue('postalPostalCode', physicalPostalCode ?? '')
    }
  }, [
    postalSameAsPhysical,
    physicalLine1,
    physicalLine2,
    physicalSuburb,
    physicalCity,
    physicalProvince,
    physicalPostalCode,
    setValue,
  ])

  function onSubmit(data: ProfileFormValues) {
    setSuccessMessage(null)
    updateProfile.reset()

    const payload: UpdateProfileRequest = {
      email: profile!.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      physicalAddress: {
        line1: data.physicalLine1 || null,
        line2: data.physicalLine2 || null,
        suburb: data.physicalSuburb || null,
        city: data.physicalCity || null,
        province: data.physicalProvince || null,
        postalCode: data.physicalPostalCode || null,
      },
      postalAddress: {
        line1: data.postalLine1 || null,
        line2: data.postalLine2 || null,
        suburb: data.postalSuburb || null,
        city: data.postalCity || null,
        province: data.postalProvince || null,
        postalCode: data.postalPostalCode || null,
      },
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        setSuccessMessage('Profile updated successfully.')
      },
      onError: () => {
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-(--sf-muted-text)" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-(--sf-text)">Profile</h1>
        <p className="mt-1 text-sm text-(--sf-muted-text)">
          Manage your personal information and delivery addresses.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        {/* Success message */}
        {successMessage && (
          <div className="rounded-md bg-(--c-success)/10 p-3" role="status">
            <p className="text-sm font-medium text-(--c-success)">{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {updateProfile.isError && (
          <div className="rounded-md bg-(--c-error)/10 p-3" role="alert">
            <p className="text-sm font-medium text-(--c-error)">
              Something went wrong updating your profile. Please try again.
            </p>
          </div>
        )}

        {/* Personal Information */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-medium text-(--sf-text)">Personal Information</legend>

          {/* Email (read-only) */}
          <div>
            <InputField
              id="email"
              type="email"
              value={profile?.email ?? ''}
              readOnly
              disabled
              label="Email address"
              helperText="Email cannot be changed."
              className="bg-(--sf-surface-muted) text-(--sf-muted-text)"
            />
          </div>

          {/* First Name */}
          <div>
            <InputField
              id="firstName"
              type="text"
              autoComplete="given-name"
              label="First name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
          </div>

          {/* Last Name */}
          <div>
            <InputField
              id="lastName"
              type="text"
              autoComplete="family-name"
              label="Last name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          {/* Phone */}
          <div>
            <InputField
              id="phone"
              type="tel"
              autoComplete="tel"
              label={<OptionalLabel>Phone number</OptionalLabel>}
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
        </fieldset>

        {/* Physical Address */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-medium text-(--sf-text)">Physical Address</legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <InputField
                id="physicalLine1"
                type="text"
                autoComplete="address-line1"
                label="Address line 1"
                {...register('physicalLine1')}
              />
            </div>

            <div className="sm:col-span-2">
              <InputField
                id="physicalLine2"
                type="text"
                autoComplete="address-line2"
                label={<OptionalLabel>Address line 2</OptionalLabel>}
                {...register('physicalLine2')}
              />
            </div>

            <div>
              <InputField
                id="physicalSuburb"
                type="text"
                label={<OptionalLabel>Suburb</OptionalLabel>}
                {...register('physicalSuburb')}
              />
            </div>

            <div>
              <InputField
                id="physicalCity"
                type="text"
                autoComplete="address-level2"
                label="City"
                {...register('physicalCity')}
              />
            </div>

            <div>
              <InputField
                id="physicalProvince"
                type="text"
                autoComplete="address-level1"
                label="Province"
                {...register('physicalProvince')}
              />
            </div>

            <div>
              <InputField
                id="physicalPostalCode"
                type="text"
                autoComplete="postal-code"
                label="Postal code"
                {...register('physicalPostalCode')}
              />
            </div>
          </div>
        </fieldset>

        {/* Postal Address */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-medium text-(--sf-text)">Postal Address</legend>

          <div className="flex items-center gap-2">
            <input
              id="postalSameAsPhysical"
              type="checkbox"
              className="h-4 w-4 rounded border-(--sf-border) text-(--sf-accent) focus:ring-(--sf-ring)"
              {...register('postalSameAsPhysical')}
            />
            <label htmlFor="postalSameAsPhysical" className="text-sm text-(--sf-text)">
              Postal address same as physical
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <InputField
                id="postalLine1"
                type="text"
                autoComplete="address-line1"
                disabled={postalSameAsPhysical}
                label="Address line 1"
                className={DISABLED_CLASSES}
                {...register('postalLine1')}
              />
            </div>

            <div className="sm:col-span-2">
              <InputField
                id="postalLine2"
                type="text"
                autoComplete="address-line2"
                disabled={postalSameAsPhysical}
                label={<OptionalLabel>Address line 2</OptionalLabel>}
                className={DISABLED_CLASSES}
                {...register('postalLine2')}
              />
            </div>

            <div>
              <InputField
                id="postalSuburb"
                type="text"
                disabled={postalSameAsPhysical}
                label={<OptionalLabel>Suburb</OptionalLabel>}
                className={DISABLED_CLASSES}
                {...register('postalSuburb')}
              />
            </div>

            <div>
              <InputField
                id="postalCity"
                type="text"
                autoComplete="address-level2"
                disabled={postalSameAsPhysical}
                label="City"
                className={DISABLED_CLASSES}
                {...register('postalCity')}
              />
            </div>

            <div>
              <InputField
                id="postalProvince"
                type="text"
                autoComplete="address-level1"
                disabled={postalSameAsPhysical}
                label="Province"
                className={DISABLED_CLASSES}
                {...register('postalProvince')}
              />
            </div>

            <div>
              <InputField
                id="postalPostalCode"
                type="text"
                autoComplete="postal-code"
                disabled={postalSameAsPhysical}
                label="Postal code"
                className={DISABLED_CLASSES}
                {...register('postalPostalCode')}
              />
            </div>
          </div>
        </fieldset>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || updateProfile.isPending}
            className={`inline-flex items-center rounded-md bg-(--sf-accent) px-4 py-2 text-sm font-medium text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Password change section */}
      <PasswordSection hasPassword={profile?.hasPassword ?? true} />
    </div>
  )
}

// --- PasswordSection ---

const passwordSchema = (hasPassword: boolean) =>
  z
    .object({
      currentPassword: hasPassword
        ? z.string().min(1, 'Current password is required')
        : z.string().optional(),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })

type PasswordFormValues = z.infer<ReturnType<typeof passwordSchema>>

function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const changePassword = useChangePassword()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema(hasPassword)),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  function onSubmit(data: PasswordFormValues) {
    setSuccessMessage(null)
    setApiError(null)

    changePassword.mutate(
      {
        currentPassword: data.currentPassword ?? '',
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          reset()
          setSuccessMessage(
            hasPassword
              ? 'Password changed successfully.'
              : 'Password set successfully.'
          )
        },
        onError: (error: AxiosError) => {
          if (error.response?.status === 401) {
            setApiError('Current password is incorrect')
          } else {
            setApiError('Password change failed. Please try again.')
          }
        },
      }
    )
  }

  return (
    <section className="border-t border-(--sf-border) pt-8">
      <h2 className="text-lg font-medium text-(--sf-text)">
        {hasPassword ? 'Change password' : 'Set a password'}
      </h2>
      <p className="mt-1 text-sm text-(--sf-muted-text)">
        {hasPassword
          ? 'Update your account password.'
          : 'Set a password to secure your account.'}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-4 space-y-4 max-w-md"
      >
        {/* Success message */}
        {successMessage && (
          <div className="rounded-md bg-(--c-success)/10 p-3" role="status">
            <p className="text-sm font-medium text-(--c-success)">{successMessage}</p>
          </div>
        )}

        {/* API error message */}
        {apiError && (
          <div className="rounded-md bg-(--c-error)/10 p-3" role="alert">
            <p className="text-sm font-medium text-(--c-error)">{apiError}</p>
          </div>
        )}

        {/* Current Password — only for registered users with a password */}
        {hasPassword && (
          <div>
            <PasswordField
              id="currentPassword"
              autoComplete="current-password"
              label="Current password"
              toggleNoun="current password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
          </div>
        )}

        {/* New Password */}
        <div>
          <PasswordField
            id="newPassword"
            autoComplete="new-password"
            label="New password"
            toggleNoun="new password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <PasswordField
            id="confirmPassword"
            autoComplete="new-password"
            label="Confirm new password"
            toggleNoun="confirm password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={changePassword.isPending}
            className={`inline-flex items-center rounded-md bg-(--sf-accent) px-4 py-2 text-sm font-medium text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {changePassword.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {changePassword.isPending
              ? 'Saving…'
              : hasPassword
                ? 'Change password'
                : 'Set password'}
          </button>
        </div>
      </form>
    </section>
  )
}
