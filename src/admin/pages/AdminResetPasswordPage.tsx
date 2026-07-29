import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminResetPassword } from '@/admin/hooks/auth/useAdminResetPassword'
import { useAdminLogin } from '@/admin/hooks/auth/useAdminLogin'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { PasswordField } from '@/shared/ui/components'

interface ResetFormValues {
  password: string
  confirmPassword: string
}

export function AdminResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const sessionEmail = useAdminAuthStore((s) => s.email)
  // Router state carries the email on the hop straight from sign-in, but it does not
  // survive a reload — and AdminGuard sends flagged accounts here on every load. Fall
  // back to the session so a refresh does not bounce the user back to the login page.
  const email = (location.state as { email?: string } | null)?.email ?? sessionEmail ?? ''

  const { mutate: resetPassword, isPending, error } = useAdminResetPassword()
  const { mutate: login } = useAdminLogin()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({ defaultValues: { password: '', confirmPassword: '' } })

  if (!email) {
    navigate('/admin/login', { replace: true })
    return null
  }

  const serverError =
    error && typeof error === 'object' && 'response' in error
      ? ((error as { response?: { data?: unknown } }).response?.data as string) ??
        'Password reset failed.'
      : null

  const onSubmit = (values: ResetFormValues) => {
    resetPassword(
      { email, password: values.password, confirmPassword: values.confirmPassword },
      {
        onSuccess: () => {
          login(
            { email, password: values.password },
            {
              onSuccess: () => navigate('/admin/dashboard', { replace: true }),
              onError: () => navigate('/admin/login', { replace: true }),
            },
          )
        },
      },
    )
  }

  // This page rendered outside AdminLayout with no data-surface at all, so --c-*
  // fell through to :root and --c-control-h-* (defined only under [data-density])
  // was undefined. Both attributes are load-bearing for the shared components.
  return (
    <div
      data-surface="admin"
      data-density="comfortable"
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--c-bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8 shadow-lg"
        style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
      >
        <h1 className="mb-1 text-center text-2xl font-bold" style={{ color: 'var(--c-text)' }}>
          Set new password
        </h1>
        <p className="mb-6 text-center text-sm" style={{ color: 'var(--c-text-muted)' }}>
          Your account requires a password change before you can continue.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div>
            <PasswordField
              id="password"
              autoComplete="new-password"
              label="New password"
              toggleNoun="new password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
            />
          </div>

          <div>
            <PasswordField
              id="confirmPassword"
              autoComplete="new-password"
              label="Confirm password"
              toggleNoun="confirm password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === watch('password') || 'Passwords do not match',
              })}
            />
          </div>

          {serverError && (
            <p className="rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--c-status-red-bg)', color: 'var(--c-status-red-text)' }}>
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ background: 'var(--c-accent)', color: 'var(--c-accent-fg, #fff)' }}
          >
            {isPending ? 'Saving…' : 'Set password'}
          </button>
        </form>
      </div>
    </div>
  )
}
