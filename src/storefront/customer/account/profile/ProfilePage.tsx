import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useCustomerProfile } from '../hooks/useCustomerProfile'
import { useUpdateProfile } from '../hooks/useUpdateProfile'
import { useChangePassword } from '../hooks/useChangePassword'
import type { AxiosError } from 'axios'
import type { UpdateProfileRequest } from '../types'

const phoneRegex = /^(\+?\d[\d\s\-()]{6,})$/

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
      physicalAddressLine1: data.physicalLine1 || null,
      physicalAddressLine2: data.physicalLine2 || null,
      physicalSuburb: data.physicalSuburb || null,
      physicalCity: data.physicalCity || null,
      physicalProvince: data.physicalProvince || null,
      physicalPostalCode: data.physicalPostalCode || null,
      postalAddressLine1: data.postalLine1 || null,
      postalAddressLine2: data.postalLine2 || null,
      postalSuburb: data.postalSuburb || null,
      postalCity: data.postalCity || null,
      postalProvince: data.postalProvince || null,
      postalPostalCode: data.postalPostalCode || null,
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        setSuccessMessage('Profile updated successfully.')
      },
      onError: (error) => {
        console.error('[Profile] update failed:', error)
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
          <div className="rounded-md bg-green-50 p-3" role="status">
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error message */}
        {updateProfile.isError && (
          <div className="rounded-md bg-red-50 p-3" role="alert">
            <p className="text-sm font-medium text-red-800">
              Something went wrong updating your profile. Please try again.
            </p>
          </div>
        )}

        {/* Personal Information */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-medium text-(--sf-text)">Personal Information</legend>

          {/* Email (read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-(--sf-text)">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email ?? ''}
              readOnly
              disabled
              className="mt-1 block w-full rounded-md border border-(--sf-border) bg-(--sf-surface-muted) px-3 py-2 text-sm text-(--sf-muted-text) shadow-sm"
            />
            <p className="mt-1 text-xs text-(--sf-muted-text)">Email cannot be changed.</p>
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-(--sf-text)">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              aria-invalid={!!errors.firstName}
              className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-(--sf-text)">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              aria-invalid={!!errors.lastName}
              className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-(--sf-text)">
              Phone number <span className="text-(--sf-muted-text)">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              aria-invalid={!!errors.phone}
              className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...register('phone')}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>
        </fieldset>

        {/* Physical Address */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-medium text-(--sf-text)">Physical Address</legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="physicalLine1" className="block text-sm font-medium text-(--sf-text)">
                Address line 1
              </label>
              <input
                id="physicalLine1"
                type="text"
                autoComplete="address-line1"
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                {...register('physicalLine1')}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="physicalLine2" className="block text-sm font-medium text-(--sf-text)">
                Address line 2 <span className="text-(--sf-muted-text)">(optional)</span>
              </label>
              <input
                id="physicalLine2"
                type="text"
                autoComplete="address-line2"
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                {...register('physicalLine2')}
              />
            </div>

            <div>
              <label htmlFor="physicalSuburb" className="block text-sm font-medium text-(--sf-text)">
                Suburb <span className="text-(--sf-muted-text)">(optional)</span>
              </label>
              <input
                id="physicalSuburb"
                type="text"
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                {...register('physicalSuburb')}
              />
            </div>

            <div>
              <label htmlFor="physicalCity" className="block text-sm font-medium text-(--sf-text)">
                City
              </label>
              <input
                id="physicalCity"
                type="text"
                autoComplete="address-level2"
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                {...register('physicalCity')}
              />
            </div>

            <div>
              <label htmlFor="physicalProvince" className="block text-sm font-medium text-(--sf-text)">
                Province
              </label>
              <input
                id="physicalProvince"
                type="text"
                autoComplete="address-level1"
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                {...register('physicalProvince')}
              />
            </div>

            <div>
              <label htmlFor="physicalPostalCode" className="block text-sm font-medium text-(--sf-text)">
                Postal code
              </label>
              <input
                id="physicalPostalCode"
                type="text"
                autoComplete="postal-code"
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
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
              <label htmlFor="postalLine1" className="block text-sm font-medium text-(--sf-text)">
                Address line 1
              </label>
              <input
                id="postalLine1"
                type="text"
                autoComplete="address-line1"
                disabled={postalSameAsPhysical}
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring) disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
                {...register('postalLine1')}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="postalLine2" className="block text-sm font-medium text-(--sf-text)">
                Address line 2 <span className="text-(--sf-muted-text)">(optional)</span>
              </label>
              <input
                id="postalLine2"
                type="text"
                autoComplete="address-line2"
                disabled={postalSameAsPhysical}
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring) disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
                {...register('postalLine2')}
              />
            </div>

            <div>
              <label htmlFor="postalSuburb" className="block text-sm font-medium text-(--sf-text)">
                Suburb <span className="text-(--sf-muted-text)">(optional)</span>
              </label>
              <input
                id="postalSuburb"
                type="text"
                disabled={postalSameAsPhysical}
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring) disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
                {...register('postalSuburb')}
              />
            </div>

            <div>
              <label htmlFor="postalCity" className="block text-sm font-medium text-(--sf-text)">
                City
              </label>
              <input
                id="postalCity"
                type="text"
                autoComplete="address-level2"
                disabled={postalSameAsPhysical}
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring) disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
                {...register('postalCity')}
              />
            </div>

            <div>
              <label htmlFor="postalProvince" className="block text-sm font-medium text-(--sf-text)">
                Province
              </label>
              <input
                id="postalProvince"
                type="text"
                autoComplete="address-level1"
                disabled={postalSameAsPhysical}
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring) disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
                {...register('postalProvince')}
              />
            </div>

            <div>
              <label htmlFor="postalPostalCode" className="block text-sm font-medium text-(--sf-text)">
                Postal code
              </label>
              <input
                id="postalPostalCode"
                type="text"
                autoComplete="postal-code"
                disabled={postalSameAsPhysical}
                className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring) disabled:bg-(--sf-surface-muted) disabled:text-(--sf-muted-text)"
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
            className="inline-flex items-center rounded-md bg-(--sf-accent) px-4 py-2 text-sm font-medium text-(--sf-accent-text) shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--sf-ring) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
          console.error('[Profile] password change failed:', error)
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
          <div className="rounded-md bg-green-50 p-3" role="status">
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {/* API error message */}
        {apiError && (
          <div className="rounded-md bg-red-50 p-3" role="alert">
            <p className="text-sm font-medium text-red-800">{apiError}</p>
          </div>
        )}

        {/* Current Password — only for registered users with a password */}
        {hasPassword && (
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-(--sf-text)"
            >
              Current password
            </label>
            <div className="relative mt-1">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-describedby={
                  errors.currentPassword ? 'currentPassword-error' : undefined
                }
                aria-invalid={!!errors.currentPassword}
                className="block w-full rounded-md border border-(--sf-border) px-3 py-2 pr-10 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                {...register('currentPassword')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-(--sf-muted-text) hover:text-(--sf-text)"
                onClick={() => setShowCurrentPassword((v) => !v)}
                aria-label={
                  showCurrentPassword
                    ? 'Hide current password'
                    : 'Show current password'
                }
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p
                id="currentPassword-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.currentPassword.message}
              </p>
            )}
          </div>
        )}

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-(--sf-text)"
          >
            New password
          </label>
          <div className="relative mt-1">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-describedby={
                errors.newPassword ? 'newPassword-error' : undefined
              }
              aria-invalid={!!errors.newPassword}
              className="block w-full rounded-md border border-(--sf-border) px-3 py-2 pr-10 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...register('newPassword')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-(--sf-muted-text) hover:text-(--sf-text)"
              onClick={() => setShowNewPassword((v) => !v)}
              aria-label={
                showNewPassword ? 'Hide new password' : 'Show new password'
              }
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p
              id="newPassword-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-(--sf-text)"
          >
            Confirm new password
          </label>
          <div className="relative mt-1">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              aria-describedby={
                errors.confirmPassword ? 'confirmPassword-error' : undefined
              }
              aria-invalid={!!errors.confirmPassword}
              className="block w-full rounded-md border border-(--sf-border) px-3 py-2 pr-10 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-(--sf-muted-text) hover:text-(--sf-text)"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword
                  ? 'Hide confirm password'
                  : 'Show confirm password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p
              id="confirmPassword-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={changePassword.isPending}
            className="inline-flex items-center rounded-md bg-(--sf-accent) px-4 py-2 text-sm font-medium text-(--sf-accent-text) shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--sf-ring) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
