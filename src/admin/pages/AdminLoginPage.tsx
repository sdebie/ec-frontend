import {useState} from 'react'
import {useForm} from 'react-hook-form'
import {Navigate, useNavigate} from 'react-router-dom'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {useAdminLogin} from '@/admin/hooks/auth/useAdminLogin'
import {InputField, PasswordField} from '@/shared/ui/components'

interface LoginFormValues {
    email: string
    password: string
}

export function AdminLoginPage() {
    const {token, role} = useAdminAuthStore()
    const navigate = useNavigate()
    const {mutate: login, isPending} = useAdminLogin()
    const [serverError, setServerError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormValues>({defaultValues: {email: '', password: ''}})

    if (token && role) return <Navigate to="/admin/dashboard" replace/>

    const onSubmit = (values: LoginFormValues) => {
        setServerError(null)
        login(values, {
            onSuccess: (data) => {
                if (data.resetPassword) {
                    navigate('/admin/reset-password', {replace: true, state: {email: values.email}})
                } else {
                    navigate('/admin/dashboard', {replace: true})
                }
            },
            onError: (err: unknown) => {
                console.error('[AdminLogin] login failed:', err)
                const status =
                    err && typeof err === 'object' && 'response' in err
                        ? (err as { response?: { status?: number; data?: unknown } }).response?.status
                        : undefined
                if (status === 429) {
                    setServerError('Too many attempts — please try again later.')
                } else if (status === 403) {
                    setServerError('Access denied. Your account is inactive.')
                } else {
                    setServerError('Invalid email or password.')
                }
            },
        })
    }

    // data-density is required, not decorative: --c-control-h-* is defined only
    // under [data-density], and the shared Input sizes itself from it.
    return (
        <div data-surface="admin" data-density="comfortable"
             className="flex min-h-screen items-center justify-center"
             style={{background: 'var(--c-bg)'}}>
            <div
                className="w-full max-w-sm rounded-xl p-8 shadow-lg"
                style={{background: 'var(--c-panel)', border: '1px solid var(--c-border)'}}
            >
                <h1
                    className="mb-1 text-center text-2xl font-bold"
                    style={{color: 'var(--c-text)'}}
                >
                    Staff Portal
                </h1>
                <p className="mb-6 text-center text-sm" style={{color: 'var(--c-text-muted)'}}>
                    Sign in to your account
                </p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                    {/* Email */}
                    <div>
                        <InputField
                            id="email"
                            type="email"
                            autoComplete="email"
                            label="Email"
                            placeholder="admin@example.com"
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email'},
                            })}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <PasswordField
                            id="password"
                            autoComplete="current-password"
                            label="Password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password', {required: 'Password is required'})}
                        />
                    </div>

                    {/* Server error */}
                    {serverError && (
                        <p className="rounded-lg px-3 py-2 text-sm"
                           style={{background: 'var(--c-status-red-bg)', color: 'var(--c-status-red-text)'}}>
                            {serverError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="mt-1 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
                        style={{background: 'var(--c-accent)', color: 'var(--c-accent-fg, #fff)'}}
                    >
                        {isPending ? 'Signing in…' : 'Sign in'}
                    </button>

                    {import.meta.env.DEV && (
                        <p className="text-center text-xs" style={{color: 'var(--c-text-muted)'}}>
                            Dev: admin@gmail.com / Admin@123
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
