import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAdminResetPassword } from '@/admin/hooks/auth/useAdminResetPassword'
import { useAdminLogin } from '@/admin/hooks/auth/useAdminLogin'

interface ResetFormValues {
  password: string
  confirmPassword: string
}

export function AdminResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''

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

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--c-bg)' }}>
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
              New password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
              className="rounded-lg px-3 py-2 text-sm outline-none transition"
              style={{
                background: 'var(--c-input-bg, var(--c-bg))',
                border: errors.password
                  ? '1px solid var(--c-status-red-border)'
                  : '1px solid var(--c-border)',
                color: 'var(--c-text)',
              }}
              placeholder="••••••••"
            />
            {errors.password && (
              <span className="text-xs" style={{ color: 'var(--c-status-red-text)' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>
              Confirm password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === watch('password') || 'Passwords do not match',
              })}
              className="rounded-lg px-3 py-2 text-sm outline-none transition"
              style={{
                background: 'var(--c-input-bg, var(--c-bg))',
                border: errors.confirmPassword
                  ? '1px solid var(--c-status-red-border)'
                  : '1px solid var(--c-border)',
                color: 'var(--c-text)',
              }}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <span className="text-xs" style={{ color: 'var(--c-status-red-text)' }}>
                {errors.confirmPassword.message}
              </span>
            )}
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
