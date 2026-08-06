import { useState } from 'react'
import { InputField } from '@/shared/ui/components/form/InputField'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRequestPasswordReset } from '@/storefront/customer/auth/hooks/useRequestPasswordReset'
import { useVerifyPasswordResetCode } from '@/storefront/customer/auth/hooks/useVerifyPasswordResetCode'
import { useCompletePasswordReset } from '@/storefront/customer/auth/hooks/useCompletePasswordReset'
import { ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE } from '@/storefront/sections/shared'
import { AUTH_LINK_CLASS, AuthHeading } from './AuthPageShell'

type ResetStep = 'request' | 'verify' | 'complete' | 'success'

/**
 * Every step's primary action. Shared because the four steps sit in one flow —
 * a shopper sees them back to back, and a button that changes height or weight
 * between them reads as the page reloading. `h-10` is the storefront control
 * height, matching the fields above it.
 */
const RESET_SUBMIT_CLASS = `flex h-10 w-full items-center justify-center rounded-md bg-(--sf-accent) px-3 text-sm font-semibold text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:cursor-not-allowed disabled:opacity-50`

/**
 * The form fills whatever container it is given — the reset page's card, or the
 * modal panel when a client seeds `auth.loginStyle: 'modal'`. It must not carry
 * its own max-width: that is the shell's job, and duplicating it here means a
 * change to the card width silently stops applying to this one page.
 */
const STEP_CLASS = 'w-full space-y-8'

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
      <div className={STEP_CLASS}>
        <AuthHeading title="Reset your password">
          Enter your email address and we'll send you a reset code.
        </AuthHeading>

        <form
          onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
          className="space-y-6"
          noValidate
        >
          {requestMutation.isError && (
            <div
              role="alert"
              className="rounded-md bg-(--c-error)/10 p-3 text-sm text-(--c-error)"
            >
              {extractErrorMessage(requestMutation.error)}
            </div>
          )}

          <div>
            <InputField
              id="request-email"
              type="email"
              autoComplete="email"
              label="Email address"
              error={requestForm.formState.errors.email?.message}
              {...requestForm.register('email')}
            />
          </div>

          <button type="submit" disabled={requestMutation.isPending} className={RESET_SUBMIT_CLASS}>
            {requestMutation.isPending ? 'Sending…' : 'Send code'}
          </button>
        </form>

        {onBackToLogin && (
          <div className="text-center">
            <button type="button" onClick={onBackToLogin} className={AUTH_LINK_CLASS}>
              Back to login
            </button>
          </div>
        )}
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <div className={STEP_CLASS}>
        <AuthHeading title="Enter verification code">
          If the account exists, a 6-digit reset code has been sent. The code is valid for 10
          minutes.
        </AuthHeading>

        <form
          onSubmit={verifyForm.handleSubmit(handleVerifySubmit)}
          className="space-y-6"
          noValidate
        >
          {verifyMutation.isError && (
            <div
              role="alert"
              className="rounded-md bg-(--c-error)/10 p-3 text-sm text-(--c-error)"
            >
              {extractErrorMessage(verifyMutation.error)}
            </div>
          )}

          <div>
            <InputField
              id="verify-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              label="Verification code"
              placeholder="000000"
              error={verifyForm.formState.errors.code?.message}
              {...verifyForm.register('code')}
            />
          </div>

          <button type="submit" disabled={verifyMutation.isPending} className={RESET_SUBMIT_CLASS}>
            {verifyMutation.isPending ? 'Verifying…' : 'Verify code'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={requestMutation.isPending}
            className={`${AUTH_LINK_CLASS} disabled:opacity-50`}
          >
            {requestMutation.isPending ? 'Resending…' : 'Resend code'}
          </button>
          {resendMessage && (
            <p className="text-sm text-(--sf-success)">{resendMessage}</p>
          )}
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className={STEP_CLASS}>
        <AuthHeading title="Set new password">Enter your new password below.</AuthHeading>

        <form
          onSubmit={completeForm.handleSubmit(handleCompleteSubmit)}
          className="space-y-6"
          noValidate
        >
          {completeMutation.isError && (
            <div
              role="alert"
              className="rounded-md bg-(--c-error)/10 p-3 text-sm text-(--c-error)"
            >
              {extractErrorMessage(completeMutation.error)}
            </div>
          )}

          <div>
            <InputField
              id="new-password"
              type="password"
              autoComplete="new-password"
              label="New password"
              error={completeForm.formState.errors.newPassword?.message}
              {...completeForm.register('newPassword')}
            />
          </div>

          <div>
            <InputField
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              label="Confirm password"
              error={completeForm.formState.errors.confirmPassword?.message}
              {...completeForm.register('confirmPassword')}
            />
          </div>

          <button type="submit" disabled={completeMutation.isPending} className={RESET_SUBMIT_CLASS}>
            {completeMutation.isPending ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      </div>
    )
  }

  // step === 'success'
  return (
    <div className={STEP_CLASS}>
      <AuthHeading title="Password reset successful.">
        You can now sign in with your new password.
      </AuthHeading>

      {onBackToLogin && (
        <div className="text-center">
          <button type="button" onClick={onBackToLogin} className={AUTH_LINK_CLASS}>
            Back to login
          </button>
        </div>
      )}
    </div>
  )
}
