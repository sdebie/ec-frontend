import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { type CredentialResponse } from '@react-oauth/google'
import { Loader2 } from 'lucide-react'
import { useCustomerRegister } from '@/storefront/customer/auth/hooks/useCustomerRegister'
import { useCustomerGoogleLogin } from '@/storefront/customer/auth/hooks/useCustomerGoogleLogin'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { isRelativePath } from '@/storefront/customer/auth/utils/urlValidation'
import { InputField } from '@/shared/ui/components/form/InputField'
import { PasswordField } from '@/shared/ui/components/form/PasswordField'
import { ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE } from '@/storefront/sections/shared'
import { GoogleAuthButton } from '@/storefront/customer/auth/components/GoogleAuthButton'
import {
  AUTH_LINK_CLASS,
  AuthHeading,
  AuthPageShell,
} from '@/storefront/customer/auth/components/AuthPageShell'

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
        <p className="text-sm text-(--c-error)" role="alert">
          An account with this email already exists.{' '}
          <Link to="/account/login" className="font-medium text-(--sf-accent) underline hover:opacity-80">
            Sign in instead
          </Link>
        </p>
      )
    }

    return (
      <p className="text-sm text-(--c-error)" role="alert">
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
    <AuthPageShell width="wide">
      <AuthHeading title="Create your account">
        <p>Already have an account?</p>
        <Link to="/account/login" className={`mt-1 inline-block ${AUTH_LINK_CLASS}`}>
          Sign in
        </Link>
      </AuthHeading>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {getServerError()}

        {/* Two columns from `sm` up, one below it. The pairs are the fields a
            shopper reads as a unit — the two halves of a name, then a password
            and its confirmation — so a row never splits an unrelated pair.
            InputField renders a fragment, so each field keeps its own wrapper
            div: that div is the grid cell. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <InputField
              id="firstName"
              type="text"
              autoComplete="given-name"
              label="First name"
              error={errors.firstName?.message}
              {...registerField('firstName')}
            />
          </div>

          <div>
            <InputField
              id="lastName"
              type="text"
              autoComplete="family-name"
              label="Last name"
              error={errors.lastName?.message}
              {...registerField('lastName')}
            />
          </div>

          {/* Full width: an address is the longest value on the form, and half a
              column truncates it under the cursor while typing. */}
          <div className="sm:col-span-2">
            <InputField
              id="email"
              type="email"
              autoComplete="email"
              label="Email address"
              error={errors.email?.message}
              {...registerField('email')}
            />
          </div>

          <div>
            <PasswordField
              id="password"
              autoComplete="new-password"
              label="Password"
              error={errors.password?.message}
              {...registerField('password')}
            />
          </div>

          <div>
            <PasswordField
              id="confirmPassword"
              autoComplete="new-password"
              label="Confirm password"
              error={errors.confirmPassword?.message}
              {...registerField('confirmPassword')}
            />
          </div>
        </div>

        {/* h-10 matches the fields above and the Google button below — see the
            note on the sign-in form's submit button. */}
        <button
          type="submit"
          disabled={isPending}
          className={`flex h-10 w-full items-center justify-center rounded-md bg-(--sf-accent) px-4 text-sm font-semibold text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-(--sf-border)" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-(--sf-panel) px-2 text-(--sf-muted-text)">Or continue with</span>
        </div>
      </div>

      <div className="mt-6">
        <GoogleAuthButton onSuccess={handleGoogleSuccess} />
      </div>
    </AuthPageShell>
  )
}
