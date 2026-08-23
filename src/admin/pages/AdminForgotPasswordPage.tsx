import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { InputField, PasswordField } from '@/shared/ui/components'
import { useInitiateStaffPasswordReset } from '@/admin/hooks/auth/useInitiateStaffPasswordReset'
import { useCompleteStaffPasswordReset } from '@/admin/hooks/auth/useCompleteStaffPasswordReset'

type ResetStep = 'request' | 'code'

const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const codeSchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RequestFormValues = z.infer<typeof requestSchema>
type CodeFormValues = z.infer<typeof codeSchema>

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number; data?: unknown } }
    if (axiosError.response?.status === 429) {
      return 'Too many attempts — please try again later.'
    }
    const data = axiosError.response?.data
    if (typeof data === 'string' && data) {
      return data
    }
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message
    }
  }
  return 'Something went wrong. Please try again.'
}

export function AdminForgotPasswordPage() {
  const navigate = useNavigate()
  // Keyed on `step` (see the request/code trees below) so a transition remounts
  // rather than reconciles — otherwise React reuses the same <input> DOM node
  // across steps and an uncontrolled input's value survives the switch.
  const [step, setStep] = useState<ResetStep>('request')
  const [email, setEmail] = useState('')

  const { mutate: initiate, isPending: isInitiating } = useInitiateStaffPasswordReset()
  const {
    mutate: complete,
    isPending: isCompleting,
    isError: isCompleteError,
    error: completeError,
  } = useCompleteStaffPasswordReset()

  const requestForm = useForm<RequestFormValues>({ resolver: zodResolver(requestSchema) })
  const codeForm = useForm<CodeFormValues>({ resolver: zodResolver(codeSchema) })

  function onRequestSubmit(values: RequestFormValues) {
    initiate(
      { email: values.email },
      {
        // Always advances, whatever the response — the account may not exist,
        // may be inactive, or a code may already be live. Branching on the
        // outcome here would let this screen be used to enumerate accounts.
        onSuccess: () => {
          setEmail(values.email)
          setStep('code')
        },
      },
    )
  }

  function onCodeSubmit(values: CodeFormValues) {
    complete(
      {
        email,
        code: values.code,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      },
      {
        // No auto-sign-in: the staff member proves their new password by using
        // it, same as any other login.
        onSuccess: () => navigate('/admin/login', { replace: true, state: { passwordReset: true } }),
      },
    )
  }

  // data-density is required, not decorative: --c-control-h-* is defined only
  // under [data-density], and the shared Input/Password fields size from it.
  return (
    <div
      data-surface="admin"
      data-density="comfortable"
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--c-bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8 shadow-lg"
        style={{ background: 'var(--c-panel)', border: '1px solid var(--c-border)' }}
      >
        {step === 'request' ? (
          <div key={step}>
            <h1 className="mb-1 text-center text-2xl font-bold" style={{ color: 'var(--c-text)' }}>
              Reset your password
            </h1>
            <p className="mb-6 text-center text-sm" style={{ color: 'var(--c-text-muted)' }}>
              Enter your email address and we&apos;ll send you a reset code.
            </p>

            <form
              onSubmit={requestForm.handleSubmit(onRequestSubmit)}
              noValidate
              className="flex flex-col gap-4"
            >
              <InputField
                id="forgot-password-email"
                type="email"
                autoComplete="email"
                label="Email address"
                error={requestForm.formState.errors.email?.message}
                {...requestForm.register('email')}
              />

              <button
                type="submit"
                disabled={isInitiating}
                className="mt-1 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
                style={{ background: 'var(--c-accent)', color: 'var(--c-accent-fg, #fff)' }}
              >
                {isInitiating ? 'Sending…' : 'Send code'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/admin/login"
                className="text-sm"
                style={{ color: 'var(--c-accent)' }}
              >
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <div key={step}>
            <h1 className="mb-1 text-center text-2xl font-bold" style={{ color: 'var(--c-text)' }}>
              Enter verification code
            </h1>
            <p className="mb-6 text-center text-sm" style={{ color: 'var(--c-text-muted)' }}>
              If the account exists, a 6-digit reset code has been sent. The code is valid for 5
              minutes.
            </p>

            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} noValidate className="flex flex-col gap-4">
              <InputField
                id="forgot-password-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                label="Verification code"
                placeholder="000000"
                error={codeForm.formState.errors.code?.message}
                {...codeForm.register('code')}
              />

              <PasswordField
                id="forgot-password-new-password"
                autoComplete="new-password"
                label="New password"
                toggleNoun="new password"
                error={codeForm.formState.errors.newPassword?.message}
                {...codeForm.register('newPassword')}
              />

              <PasswordField
                id="forgot-password-confirm-password"
                autoComplete="new-password"
                label="Confirm password"
                toggleNoun="confirm password"
                error={codeForm.formState.errors.confirmPassword?.message}
                {...codeForm.register('confirmPassword')}
              />

              {isCompleteError && (
                <p
                  role="alert"
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--c-status-red-bg)', color: 'var(--c-status-red-text)' }}
                >
                  {extractErrorMessage(completeError)}
                </p>
              )}

              <button
                type="submit"
                disabled={isCompleting}
                className="mt-1 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
                style={{ background: 'var(--c-accent)', color: 'var(--c-accent-fg, #fff)' }}
              >
                {isCompleting ? 'Resetting…' : 'Reset password'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/admin/login" className="text-sm" style={{ color: 'var(--c-accent)' }}>
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
