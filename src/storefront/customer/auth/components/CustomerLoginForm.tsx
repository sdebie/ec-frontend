import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useCustomerLogin } from '@/storefront/customer/auth/hooks/useCustomerLogin'
import { useCustomerGoogleLogin } from '@/storefront/customer/auth/hooks/useCustomerGoogleLogin'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { status?: string } } }
    const status = axiosError.response?.status

    if (status === 401 || status === 403) {
      return 'Invalid email or password.'
    }

    if (status === 400) {
      const responseStatus = axiosError.response?.data?.status
      if (responseStatus === 'PENDING' || responseStatus === 'DISABLED') {
        return 'Your account is not active. Please contact support.'
      }
    }
  }

  return 'Something went wrong. Please try again.'
}

export interface CustomerLoginFormProps {
  onSuccess?: () => void
  onForgotPassword?: () => void
}

export function CustomerLoginForm({ onSuccess, onForgotPassword }: CustomerLoginFormProps) {
  const { mutate: login, isPending, isError, error } = useCustomerLogin()
  const { mutate: googleLogin } = useCustomerGoogleLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginFormData) {
    login(data, {
      onSuccess: () => {
        onSuccess?.()
      },
    })
  }

  function handleGoogleSuccess(response: CredentialResponse) {
    const credential = response.credential
    if (!credential) return

    googleLogin(credential, {
      onSuccess: () => {
        onSuccess?.()
      },
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {isError && (
          <div
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {getErrorMessage(error)}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-(--sf-text)"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={errors.email ? 'true' : undefined}
            className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm placeholder:text-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-(--sf-text)"
          >
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={errors.password ? 'true' : undefined}
              className="block w-full rounded-md border border-(--sf-border) px-3 py-2 pr-10 text-sm shadow-sm placeholder:text-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-(--sf-muted-text) hover:text-(--sf-text)"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {onForgotPassword && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium text-(--sf-accent) hover:opacity-80"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-md bg-(--sf-accent) px-3 py-2 text-sm font-semibold text-(--sf-accent-text) shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
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

      <div className="mt-6 flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            // Silent cancel — no error shown per requirement 8.6
          }}
          text="signin_with"
          width="400"
        />
      </div>
    </>
  )
}
