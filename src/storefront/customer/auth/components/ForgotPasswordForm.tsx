import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRequestPasswordReset } from '@/storefront/customer/auth/hooks/useRequestPasswordReset'
import { useVerifyPasswordResetCode } from '@/storefront/customer/auth/hooks/useVerifyPasswordResetCode'
import { useCompletePasswordReset } from '@/storefront/customer/auth/hooks/useCompletePasswordReset'

type ResetStep = 'request' | 'verify' | 'complete' | 'success'

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void
}

const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const verifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
})

const completeSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RequestFormData = z.infer<typeof requestSchema>
type VerifyFormData = z.infer<typeof verifySchema>
type CompleteFormData = z.infer<typeof completeSchema>

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { status?: number; data?: { message?: string } }
    }
    const status = axiosError.response?.status
    if (status && status >= 400 && status < 500) {
      return axiosError.response?.data?.message ?? 'Request failed. Please try again.'
    }
  }
  return 'Something went wrong. Please try again.'
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<ResetStep>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [resendMessage, setResendMessage] = useState('')

  const requestMutation = useRequestPasswordReset()
  const verifyMutation = useVerifyPasswordResetCode()
  const completeMutation = useCompletePasswordReset()

  const requestForm = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  })

  const verifyForm = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  })

  const completeForm = useForm<CompleteFormData>({
    resolver: zodResolver(completeSchema),
  })

  function handleRequestSubmit(data: RequestFormData) {
    requestMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setEmail(data.email)
          setStep('verify')
        },
      },
    )
  }

  function handleVerifySubmit(data: VerifyFormData) {
    verifyMutation.mutate(
      { email, code: data.code },
      {
        onSuccess: () => {
          setCode(data.code)
          setStep('complete')
        },
      },
    )
  }

  function handleCompleteSubmit(data: CompleteFormData) {
    completeMutation.mutate(
      {
        email,
        code,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          setStep('success')
        },
      },
    )
  }

  function handleResendCode() {
    setResendMessage('')
    requestMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setResendMessage('Code resent')
        },
      },
    )
  }

  if (step === 'request') {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-(--sf-text)">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-(--sf-muted-text)">
            Enter your email address and we'll send you a reset code.
          </p>
        </div>

        <form
          onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
          className="space-y-6"
          noValidate
        >
          {requestMutation.isError && (
            <div
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-(--c-status-red-text)"
            >
              {extractErrorMessage(requestMutation.error)}
            </div>
          )}

          <div>
            <label
              htmlFor="request-email"
              className="block text-sm font-medium text-(--sf-text)"
            >
              Email address
            </label>
            <input
              id="request-email"
              type="email"
              autoComplete="email"
              aria-describedby={
                requestForm.formState.errors.email ? 'request-email-error' : undefined
              }
              aria-invalid={requestForm.formState.errors.email ? 'true' : undefined}
              className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm placeholder:text-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...requestForm.register('email')}
            />
            {requestForm.formState.errors.email && (
              <p id="request-email-error" className="mt-1 text-sm text-red-600">
                {requestForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={requestMutation.isPending}
            className="flex w-full justify-center rounded-md bg-(--sf-accent) px-3 py-2 text-sm font-semibold text-(--sf-accent-text) shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {requestMutation.isPending ? 'Sending…' : 'Send code'}
          </button>
        </form>

        {onBackToLogin && (
          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm font-medium text-(--sf-accent) hover:opacity-80"
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-(--sf-text)">
            Enter verification code
          </h1>
          <p className="mt-2 text-sm text-(--sf-muted-text)">
            If the account exists, a 6-digit reset code has been sent. The code is valid
            for 10 minutes.
          </p>
        </div>

        <form
          onSubmit={verifyForm.handleSubmit(handleVerifySubmit)}
          className="space-y-6"
          noValidate
        >
          {verifyMutation.isError && (
            <div
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-(--c-status-red-text)"
            >
              {extractErrorMessage(verifyMutation.error)}
            </div>
          )}

          <div>
            <label
              htmlFor="verify-code"
              className="block text-sm font-medium text-(--sf-text)"
            >
              Verification code
            </label>
            <input
              id="verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              aria-describedby={
                verifyForm.formState.errors.code ? 'verify-code-error' : undefined
              }
              aria-invalid={verifyForm.formState.errors.code ? 'true' : undefined}
              className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm placeholder:text-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              placeholder="000000"
              {...verifyForm.register('code')}
            />
            {verifyForm.formState.errors.code && (
              <p id="verify-code-error" className="mt-1 text-sm text-red-600">
                {verifyForm.formState.errors.code.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="flex w-full justify-center rounded-md bg-(--sf-accent) px-3 py-2 text-sm font-semibold text-(--sf-accent-text) shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifyMutation.isPending ? 'Verifying…' : 'Verify code'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={requestMutation.isPending}
            className="text-sm font-medium text-(--sf-accent) hover:opacity-80 disabled:opacity-50"
          >
            {requestMutation.isPending ? 'Resending…' : 'Resend code'}
          </button>
          {resendMessage && (
            <p className="text-sm text-green-600">{resendMessage}</p>
          )}
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-(--sf-text)">
            Set new password
          </h1>
          <p className="mt-2 text-sm text-(--sf-muted-text)">
            Enter your new password below.
          </p>
        </div>

        <form
          onSubmit={completeForm.handleSubmit(handleCompleteSubmit)}
          className="space-y-6"
          noValidate
        >
          {completeMutation.isError && (
            <div
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-(--c-status-red-text)"
            >
              {extractErrorMessage(completeMutation.error)}
            </div>
          )}

          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-(--sf-text)"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              aria-describedby={
                completeForm.formState.errors.newPassword
                  ? 'new-password-error'
                  : undefined
              }
              aria-invalid={
                completeForm.formState.errors.newPassword ? 'true' : undefined
              }
              className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm placeholder:text-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...completeForm.register('newPassword')}
            />
            {completeForm.formState.errors.newPassword && (
              <p id="new-password-error" className="mt-1 text-sm text-red-600">
                {completeForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-(--sf-text)"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              aria-describedby={
                completeForm.formState.errors.confirmPassword
                  ? 'confirm-password-error'
                  : undefined
              }
              aria-invalid={
                completeForm.formState.errors.confirmPassword ? 'true' : undefined
              }
              className="mt-1 block w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm shadow-sm placeholder:text-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
              {...completeForm.register('confirmPassword')}
            />
            {completeForm.formState.errors.confirmPassword && (
              <p id="confirm-password-error" className="mt-1 text-sm text-red-600">
                {completeForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={completeMutation.isPending}
            className="flex w-full justify-center rounded-md bg-(--sf-accent) px-3 py-2 text-sm font-semibold text-(--sf-accent-text) shadow-sm hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--sf-ring) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {completeMutation.isPending ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    )
  }

  // step === 'success'
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-(--sf-text)">
          Password reset successful.
        </h1>
        <p className="mt-2 text-sm text-(--sf-muted-text)">
          You can now sign in with your new password.
        </p>
      </div>

      {onBackToLogin && (
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm font-medium text-(--sf-accent) hover:opacity-80"
          >
            Back to login
          </button>
        </div>
      )}
    </div>
  )
}
