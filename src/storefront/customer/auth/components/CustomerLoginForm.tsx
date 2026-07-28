import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useCustomerLogin } from '@/storefront/customer/auth/hooks/useCustomerLogin'
import { useCustomerGoogleLogin } from '@/storefront/customer/auth/hooks/useCustomerGoogleLogin'
import { InputField } from '@/shared/ui/components/form/InputField'
import { PasswordField } from '@/shared/ui/components/form/PasswordField'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: { status?: string } } }
    const status = axiosError.response?.status

    if (status === 429) {
      return 'Too many attempts — please try again later.'
    }

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
            className="rounded-md bg-(--c-error)/10 p-3 text-sm text-(--c-error)"
          >
            {getErrorMessage(error)}
          </div>
        )}

        <div>
          <InputField
            id="email"
            type="email"
            autoComplete="email"
            label="Email address"
            error={errors.email?.message}
            aria-invalid={errors.email ? 'true' : undefined}
            {...register('email')}
          />
        </div>

        <div>
          <PasswordField
            id="password"
            autoComplete="current-password"
            label="Password"
            error={errors.password?.message}
            aria-invalid={errors.password ? 'true' : undefined}
            {...register('password')}
          />
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
