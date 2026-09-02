import type {BaseSyntheticEvent} from 'react'
import type {FieldErrors, UseFormRegister} from 'react-hook-form'
import {Link} from 'react-router-dom'
import {InputField, PasswordField} from '@/shared/ui/components'
import type {CodeFormValues} from '../forgotPasswordSchema'

interface ResetCodeStepProps {
    register: UseFormRegister<CodeFormValues>
    errors: FieldErrors<CodeFormValues>
    onSubmit: (e?: BaseSyntheticEvent) => Promise<void>
    isPending: boolean
    isError: boolean
    errorMessage: string | undefined
}

export function ResetCodeStep({
                                  register,
                                  errors,
                                  onSubmit,
                                  isPending,
                                  isError,
                                  errorMessage,
                              }: ResetCodeStepProps) {
    return (
        <div>
            <h1 className="mb-1 text-center text-2xl font-bold" style={{color: 'var(--c-text)'}}>
                Enter verification code
            </h1>
            <p className="mb-6 text-center text-sm" style={{color: 'var(--c-text-muted)'}}>
                If the account exists, a 6-digit reset code has been sent. The code is valid for 5
                minutes.
            </p>

            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <InputField
                    id="forgot-password-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    label="Verification code"
                    placeholder="000000"
                    error={errors.code?.message}
                    {...register('code')}
                />

                <PasswordField
                    id="forgot-password-new-password"
                    autoComplete="new-password"
                    label="New password"
                    toggleNoun="new password"
                    error={errors.newPassword?.message}
                    {...register('newPassword')}
                />

                <PasswordField
                    id="forgot-password-confirm-password"
                    autoComplete="new-password"
                    label="Confirm password"
                    toggleNoun="confirm password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />

                {isError && (
                    <p
                        role="alert"
                        className="rounded-lg px-3 py-2 text-sm"
                        style={{background: 'var(--c-status-red-bg)', color: 'var(--c-status-red-text)'}}
                    >
                        {errorMessage}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className="mt-1 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
                    style={{background: 'var(--c-accent)', color: 'var(--c-accent-fg, #fff)'}}
                >
                    {isPending ? 'Resetting…' : 'Reset password'}
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
