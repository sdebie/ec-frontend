import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {ForgotPasswordForm} from '../ForgotPasswordForm'
import {useRequestPasswordReset} from '@/storefront/customer/auth/hooks/useRequestPasswordReset'
import {useVerifyPasswordResetCode} from '@/storefront/customer/auth/hooks/useVerifyPasswordResetCode'
import {useCompletePasswordReset} from '@/storefront/customer/auth/hooks/useCompletePasswordReset'

// Mock all three hooks
vi.mock('@/storefront/customer/auth/hooks/useRequestPasswordReset')
vi.mock('@/storefront/customer/auth/hooks/useVerifyPasswordResetCode')
vi.mock('@/storefront/customer/auth/hooks/useCompletePasswordReset')

interface MutationMock {
    mutate: Mock
    isPending: boolean
    isError: boolean
    error: unknown
}

function createMockMutation(overrides: Partial<MutationMock> = {}): MutationMock {
    return {
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        error: null,
        ...overrides,
    }
}

/**
 * Helper: creates a mutate mock that immediately invokes onSuccess when called.
 */
function createSuccessMutate() {
    return vi.fn((_variables: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.()
    })
}

/**
 * Helper: fills an input using fireEvent.change for reliable value setting.
 */
function fillInput(element: HTMLElement, value: string) {
    fireEvent.change(element, {target: {value}})
}

describe('ForgotPasswordForm', () => {
    let requestMutation: MutationMock
    let verifyMutation: MutationMock
    let completeMutation: MutationMock

    beforeEach(() => {
        requestMutation = createMockMutation({mutate: createSuccessMutate()})
        verifyMutation = createMockMutation({mutate: createSuccessMutate()})
        completeMutation = createMockMutation({mutate: createSuccessMutate()})

        ;(useRequestPasswordReset as Mock).mockReturnValue(requestMutation)
        ;(useVerifyPasswordResetCode as Mock).mockReturnValue(verifyMutation)
        ;(useCompletePasswordReset as Mock).mockReturnValue(completeMutation)
    })

    describe('Step 1 — Request code', () => {
        it('renders email input, submits and advances to Step 2 on success', async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm/>)

            // Step 1 is rendered
            expect(screen.getByText('Reset your password')).toBeInTheDocument()
            const emailInput = screen.getByLabelText('Email address')
            expect(emailInput).toBeInTheDocument()

            // Fill in email and submit
            await user.type(emailInput, 'test@example.com')
            await user.click(screen.getByRole('button', {name: 'Send code'}))

            // Mutation was called with email
            await waitFor(() => {
                expect(requestMutation.mutate).toHaveBeenCalledWith(
                    {email: 'test@example.com'},
                    expect.objectContaining({onSuccess: expect.any(Function)}),
                )
            })

            // Step 2 is now rendered
            expect(screen.getByText('Enter verification code')).toBeInTheDocument()
        })
    })

    describe('Step 2 — Verify code', () => {
        async function advanceToStep2() {
            const user = userEvent.setup()
            render(<ForgotPasswordForm/>)

            await user.type(screen.getByLabelText('Email address'), 'test@example.com')
            await user.click(screen.getByRole('button', {name: 'Send code'}))

            await waitFor(() => {
                expect(screen.getByText('Enter verification code')).toBeInTheDocument()
            })

            return user
        }

        it('renders code input, validates 6-digit format, advances to Step 3 on success', async () => {
            const user = await advanceToStep2()

            const codeInput = screen.getByLabelText('Verification code')
            expect(codeInput).toBeInTheDocument()

            // Submit with valid 6-digit code using fireEvent for reliable value setting
            fillInput(codeInput, '123456')
            await user.click(screen.getByRole('button', {name: 'Verify code'}))

            // Verify mutation called
            await waitFor(() => {
                expect(verifyMutation.mutate).toHaveBeenCalledWith(
                    {email: 'test@example.com', code: '123456'},
                    expect.objectContaining({onSuccess: expect.any(Function)}),
                )
            })

            // Step 3 is now rendered
            expect(screen.getByText('Set new password')).toBeInTheDocument()
        })

        it('"Resend code" re-calls request API without changing step', async () => {
            const user = await advanceToStep2()

                // Clear previous calls from advancing to step 2
            ;(requestMutation.mutate as Mock).mockClear()

            await user.click(screen.getByRole('button', {name: /Resend code/i}))

            // Request mutation called again with same email
            expect(requestMutation.mutate).toHaveBeenCalledWith(
                {email: 'test@example.com'},
                expect.objectContaining({onSuccess: expect.any(Function)}),
            )

            // Still on step 2
            expect(screen.getByText('Enter verification code')).toBeInTheDocument()
            expect(screen.getByLabelText('Verification code')).toBeInTheDocument()
        })
    })

    describe('Step 3 — Set new password', () => {
        async function advanceToStep3() {
            const user = userEvent.setup()
            render(<ForgotPasswordForm/>)

            // Step 1
            await user.type(screen.getByLabelText('Email address'), 'test@example.com')
            await user.click(screen.getByRole('button', {name: 'Send code'}))
            await waitFor(() => {
                expect(screen.getByText('Enter verification code')).toBeInTheDocument()
            })

            // Step 2 — use fillInput for the code field
            fillInput(screen.getByLabelText('Verification code'), '123456')
            await user.click(screen.getByRole('button', {name: 'Verify code'}))
            await waitFor(() => {
                expect(screen.getByText('Set new password')).toBeInTheDocument()
            })

            return user
        }

        it('validates passwords match and minimum length before submit', async () => {
            const user = await advanceToStep3()

            const newPasswordInput = screen.getByLabelText('New password')
            const confirmPasswordInput = screen.getByLabelText('Confirm password')

            // Submit with short password
            fillInput(newPasswordInput, 'short')
            fillInput(confirmPasswordInput, 'short')
            await user.click(screen.getByRole('button', {name: 'Reset password'}))

            // Validation error shown for minimum length
            await waitFor(() => {
                expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
            })

            // Mutation not called
            expect(completeMutation.mutate).not.toHaveBeenCalled()

            // Test password mismatch
            fillInput(newPasswordInput, 'validpassword1')
            fillInput(confirmPasswordInput, 'different123')
            await user.click(screen.getByRole('button', {name: 'Reset password'}))

            await waitFor(() => {
                expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
            })

            expect(completeMutation.mutate).not.toHaveBeenCalled()
        })

        it('advances to success on completion', async () => {
            const user = await advanceToStep3()

            fillInput(screen.getByLabelText('New password'), 'newpassword123')
            fillInput(screen.getByLabelText('Confirm password'), 'newpassword123')
            await user.click(screen.getByRole('button', {name: 'Reset password'}))

            await waitFor(() => {
                expect(completeMutation.mutate).toHaveBeenCalledWith(
                    {
                        email: 'test@example.com',
                        code: '123456',
                        newPassword: 'newpassword123',
                        confirmPassword: 'newpassword123',
                    },
                    expect.objectContaining({onSuccess: expect.any(Function)}),
                )
            })

            // Success step rendered
            expect(screen.getByText('Password reset successful.')).toBeInTheDocument()
        })
    })

    describe('Step 4 — Success', () => {
        it('renders success message and calls onBackToLogin when link clicked', async () => {
            const user = userEvent.setup()
            const onBackToLogin = vi.fn()
            render(<ForgotPasswordForm onBackToLogin={onBackToLogin}/>)

            // Step 1
            await user.type(screen.getByLabelText('Email address'), 'test@example.com')
            await user.click(screen.getByRole('button', {name: 'Send code'}))
            await waitFor(() => {
                expect(screen.getByText('Enter verification code')).toBeInTheDocument()
            })

            // Step 2
            fillInput(screen.getByLabelText('Verification code'), '123456')
            await user.click(screen.getByRole('button', {name: 'Verify code'}))
            await waitFor(() => {
                expect(screen.getByText('Set new password')).toBeInTheDocument()
            })

            // Step 3
            fillInput(screen.getByLabelText('New password'), 'newpassword123')
            fillInput(screen.getByLabelText('Confirm password'), 'newpassword123')
            await user.click(screen.getByRole('button', {name: 'Reset password'}))
            await waitFor(() => {
                expect(screen.getByText('Password reset successful.')).toBeInTheDocument()
            })

            // Success message and back to login link
            expect(screen.getByText('You can now sign in with your new password.')).toBeInTheDocument()

            const backToLoginButton = screen.getByRole('button', {name: 'Back to login'})
            await user.click(backToLoginButton)

            expect(onBackToLogin).toHaveBeenCalledTimes(1)
        })
    })

    describe('Step transitions — field values must not leak', () => {
        /**
         * Each step returns a structurally identical tree at the same position, so
         * React reconciles instead of remounting and reuses the same <input> DOM
         * node. Attributes get patched; an uncontrolled input's value does not,
         * because it is DOM state. Assert the VALUE — asserting that the field is
         * present, or that typing into it works, passes in the broken state too.
         */
        it('Verification code is empty on arrival at step 2', async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm/>)

            await user.type(screen.getByLabelText('Email address'), 'test@example.com')
            await user.click(screen.getByRole('button', {name: 'Send code'}))

            await waitFor(() => {
                expect(screen.getByText('Enter verification code')).toBeInTheDocument()
            })

            expect(screen.getByLabelText('Verification code')).toHaveValue('')
        })

        it('New password and Confirm password are empty on arrival at step 3', async () => {
            const user = userEvent.setup()
            render(<ForgotPasswordForm/>)

            await user.type(screen.getByLabelText('Email address'), 'test@example.com')
            await user.click(screen.getByRole('button', {name: 'Send code'}))
            await waitFor(() => {
                expect(screen.getByText('Enter verification code')).toBeInTheDocument()
            })

            fillInput(screen.getByLabelText('Verification code'), '123456')
            await user.click(screen.getByRole('button', {name: 'Verify code'}))
            await waitFor(() => {
                expect(screen.getByText('Set new password')).toBeInTheDocument()
            })

            expect(screen.getByLabelText('New password')).toHaveValue('')
            expect(screen.getByLabelText('Confirm password')).toHaveValue('')
        })
    })

    describe('Error handling', () => {
        it('backend 400 shows inline error, not toast', async () => {
            // Override request mutation to return error state
            const errorMutation = createMockMutation({
                    mutate: vi.fn(),
                    isError: true,
                    error: {
                        response: {
                            status: 400,
                            data: {message: 'Invalid email address'},
                        },
                    },
                })
            ;(useRequestPasswordReset as Mock).mockReturnValue(errorMutation)

            render(<ForgotPasswordForm/>)

            // The inline error message is displayed via role="alert"
            const alert = screen.getByRole('alert')
            expect(alert).toBeInTheDocument()
            expect(alert).toHaveTextContent('Invalid email address')

            // No toast container — errors are inline only
            expect(screen.queryByRole('status')).not.toBeInTheDocument()
        })
    })
})
