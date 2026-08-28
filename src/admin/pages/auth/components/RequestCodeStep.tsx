import type {BaseSyntheticEvent} from 'react'
import type {FieldErrors, UseFormRegister} from 'react-hook-form'
import {Link} from 'react-router-dom'
import {InputField} from '@/shared/ui/components'
import type {RequestFormValues} from '../forgotPasswordSchema'

interface RequestCodeStepProps {
    register: UseFormRegister<RequestFormValues>
    errors: FieldErrors<RequestFormValues>
    onSubmit: (e?: BaseSyntheticEvent) => Promise<void>
    isPending: boolean
}

export function RequestCodeStep({register, errors, onSubmit, isPending}: RequestCodeStepProps) {
    return (
        <div>
            <h1 className="mb-1 text-center text-2xl font-bold" style={{color: 'var(--c-text)'}}>
                Reset your password
            </h1>
            <p className="mb-6 text-center text-sm" style={{color: 'var(--c-text-muted)'}}>
                Enter your email address and we&apos;ll send you a reset code.
            </p>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <InputField
                    id="forgot-password-email"
                    type="email"
                    autoComplete="email"
                    label="Email address"
                    error={errors.email?.message}
                    {...register('email')}
                />

                <button
                    type="submit"
                    disabled={isPending}
                    className="mt-1 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
                    style={{background: 'var(--c-accent)', color: 'var(--c-accent-fg, #fff)'}}
                >
                    {isPending ? 'Sending…' : 'Send code'}
                </button>
            </form>

            <div className="mt-4 text-center">
                <Link to="/admin/login" className="text-sm" style={{color: 'var(--c-accent)'}}>
                    Back to login
                </Link>
            </div>
        </div>
    )
}
