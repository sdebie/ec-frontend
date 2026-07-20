import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useCustomerRegister } from '@/storefront/customer/auth/hooks/useCustomerRegister'
import { useCustomerGoogleLogin } from '@/storefront/customer/auth/hooks/useCustomerGoogleLogin'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { isRelativePath } from '@/storefront/customer/auth/utils/urlValidation'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function AccountRegisterPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isSignedIn = useCustomerAuthStore((s) => s.isSignedIn)
  const { mutate: register, isPending, isError, error, reset: resetMutation } = useCustomerRegister()
  const { mutate: googleLogin } = useCustomerGoogleLogin()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  function handleGoogleSuccess(response: CredentialResponse) {
    if (response.credential) {
      googleLogin(response.credential, {
        onSuccess: () => {
          const returnTo = searchParams.get('return')
          navigate(returnTo && isRelativePath(returnTo) ? returnTo : '/account', { replace: true })
        },
      })
    }
  }

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  })

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      const returnTo = searchParams.get('return')
      navigate(returnTo && isRelativePath(returnTo) ? returnTo : '/account', { replace: true })
    }
  }, [isSignedIn, navigate, searchParams])

  function getServerError(): React.ReactNode | null {
    if (!isError || !error) return null

    const axiosError = error as { response?: { status?: number } }

    if (axiosError.response?.status === 409) {
      return (
        <p className="text-sm text-red-600" role="alert">
          An account with this email already exists.{' '}
          <Link to="/account/login" className="font-medium text-(--sf-accent) underline hover:opacity-80">
            Sign in instead
          </Link>
        </p>
      )
    }

    return (
      <p className="text-sm text-red-600" role="alert">
        Something went wrong. Please try again.
      </p>
    )
  }

  function onSubmit(data: RegisterFormValues) {
    resetMutation()
    register(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          const returnTo = searchParams.get('return')
          navigate(returnTo && isRelativePath(returnTo) ? returnTo : '/account', { replace: true })
        },
      },
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-(--sf-text)">Create your account</h1>
          <p className="mt-2 text-sm text-(--sf-muted-text)">
            Already have an account?{' '}
            <Link to="/account/login" className="font-medium text-(--sf-accent) hover:opacity-80">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Server error */}
          {getServerError()}

          {/* First name */}
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
              {...registerField('firstName')}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last name */}
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
              {...registerField('lastName')}
            />
            {errors.lastName && (
              <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-(--sf-text)">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...registerField('email')}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-(--sf-text)">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={!!errors.password}
                className="block w-full rounded-md border border-(--sf-border) px-3 py-2 pr-10 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                {...registerField('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-(--sf-muted-text) hover:text-(--sf-text)"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-(--sf-text)">
              Confirm password
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                aria-invalid={!!errors.confirmPassword}
                className="block w-full rounded-md border border-(--sf-border) px-3 py-2 pr-10 text-sm shadow-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                {...registerField('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-(--sf-muted-text) hover:text-(--sf-text)"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-md bg-(--sf-accent) px-4 py-2 text-sm font-medium text-(--sf-accent-text) shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-(--sf-ring) focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-(--sf-border)" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-(--sf-panel) px-2 text-(--sf-muted-text)">Or</span>
          </div>
        </div>

        {/* Google OAuth */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {/* Silent cancel per requirement 8.6 */}}
          />
        </div>
      </div>
    </div>
  )
}
