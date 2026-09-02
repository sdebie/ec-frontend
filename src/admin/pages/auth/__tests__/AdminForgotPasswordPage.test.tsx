import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {AdminForgotPasswordPage} from '../AdminForgotPasswordPage'
import {useInitiateStaffPasswordReset} from '@/admin/pages/auth/hooks/useInitiateStaffPasswordReset'
import {useCompleteStaffPasswordReset} from '@/admin/pages/auth/hooks/useCompleteStaffPasswordReset'

vi.mock('@/admin/pages/auth/hooks/useInitiateStaffPasswordReset')
vi.mock('@/admin/pages/auth/hooks/useCompleteStaffPasswordReset')

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

function createSuccessMutate() {
    return vi.fn((_variables: unknown, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.()
    })
}

function fillInput(element: HTMLElement, value: string) {
    fireEvent.change(element, {target: {value}})
}

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/admin/forgot-password']}>
            <Routes>
                <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage/>}/>
                <Route path="/admin/login" element={<div>Sign-in screen</div>}/>
            </Routes>
        </MemoryRouter>,
    )
}

describe('AdminForgotPasswordPage', () => {
    let initiateMutation: MutationMock
    let completeMutation: MutationMock

    beforeEach(() => {
        initiateMutation = createMockMutation({mutate: createSuccessMutate()})
        completeMutation = createMockMutation({mutate: createSuccessMutate()})
        ;(useInitiateStaffPasswordReset as Mock).mockReturnValue(initiateMutation)
        ;(useCompleteStaffPasswordReset as Mock).mockReturnValue(completeMutation)
    })

    it('sets data-surface and data-density on its root, load-bearing for shared control heights', () => {
        const {container} = renderPage()
        const root = container.firstElementChild as HTMLElement
        expect(root).toHaveAttribute('data-surface', 'admin')
        expect(root).toHaveAttribute('data-density', 'comfortable')
    })

    it('Step 1: renders an email field and advances to the code step on any submission, per Requirement 1.3/5.3', async () => {
        const user = userEvent.setup()
        renderPage()

        expect(screen.getByText('Reset your password')).toBeInTheDocument()
        const emailInput = screen.getByLabelText('Email address')

        await user.type(emailInput, 'staffer@example.com')
        await user.click(screen.getByRole('button', {name: 'Send code'}))

        await waitFor(() => {
            expect(initiateMutation.mutate).toHaveBeenCalledWith(
                {email: 'staffer@example.com'},
                expect.objectContaining({onSuccess: expect.any(Function)}),
            )
        })

        expect(screen.getByText('Enter verification code')).toBeInTheDocument()
    })

    it('Step 1 has a back-to-login link', async () => {
        const user = userEvent.setup()
        renderPage()

        await user.click(screen.getByRole('link', {name: 'Back to login'}))

        expect(screen.getByText('Sign-in screen')).toBeInTheDocument()
    })

    async function advanceToStep2() {
        const user = userEvent.setup()
        renderPage()

        await user.type(screen.getByLabelText('Email address'), 'staffer@example.com')
        await user.click(screen.getByRole('button', {name: 'Send code'}))

        await waitFor(() => {
            expect(screen.getByText('Enter verification code')).toBeInTheDocument()
        })

        return user
    }

    it('Step 2: submits code + new password together in one call (no separate verify step)', async () => {
        const user = await advanceToStep2()

        fillInput(screen.getByLabelText('Verification code'), '482913')
        fillInput(screen.getByLabelText('New password'), 'BrandNewPassw0rd!')
        fillInput(screen.getByLabelText('Confirm password'), 'BrandNewPassw0rd!')
        await user.click(screen.getByRole('button', {name: 'Reset password'}))

        await waitFor(() => {
            expect(completeMutation.mutate).toHaveBeenCalledWith(
                {
                    email: 'staffer@example.com',
                    code: '482913',
                    newPassword: 'BrandNewPassw0rd!',
                    confirmPassword: 'BrandNewPassw0rd!',
                },
                expect.objectContaining({onSuccess: expect.any(Function)}),
            )
        })
    })

    it('Step 2: validates 6-digit code format and matching/min-length passwords before submit', async () => {
        const user = await advanceToStep2()

        fillInput(screen.getByLabelText('Verification code'), '123')
        fillInput(screen.getByLabelText('New password'), 'short')
        fillInput(screen.getByLabelText('Confirm password'), 'different')
        await user.click(screen.getByRole('button', {name: 'Reset password'}))

        await waitFor(() => {
            expect(screen.getByText('Code must be exactly 6 digits')).toBeInTheDocument()
        })
        expect(completeMutation.mutate).not.toHaveBeenCalled()
    })

    it('Step 2 success: routes to /admin/login with a success indication and does NOT auto-sign-in (Requirement 5.4)', async () => {
        const user = await advanceToStep2()

        fillInput(screen.getByLabelText('Verification code'), '482913')
        fillInput(screen.getByLabelText('New password'), 'BrandNewPassw0rd!')
        fillInput(screen.getByLabelText('Confirm password'), 'BrandNewPassw0rd!')
        await user.click(screen.getByRole('button', {name: 'Reset password'}))

        await waitFor(() => {
            expect(screen.getByText('Sign-in screen')).toBeInTheDocument()
        })
    })

    it('Step 2: a 429 error shows a non-specific retry message, matching existing admin 429 handling', async () => {
        const errorMutation = createMockMutation({
                mutate: vi.fn(),
                isError: true,
                error: {response: {status: 429}},
            })
        ;(useCompleteStaffPasswordReset as Mock).mockReturnValue(errorMutation)

        const user = await advanceToStep2()

        fillInput(screen.getByLabelText('Verification code'), '482913')
        fillInput(screen.getByLabelText('New password'), 'BrandNewPassw0rd!')
        fillInput(screen.getByLabelText('Confirm password'), 'BrandNewPassw0rd!')
        await user.click(screen.getByRole('button', {name: 'Reset password'}))

        await waitFor(() => {
            expect(screen.getByText('Too many attempts — please try again later.')).toBeInTheDocument()
        })
    })

    it('Step 2: a 400 error shows the server message inline', async () => {
        const errorMutation = createMockMutation({
                mutate: vi.fn(),
                isError: true,
                error: {response: {status: 400, data: 'Invalid or expired reset code'}},
            })
        ;(useCompleteStaffPasswordReset as Mock).mockReturnValue(errorMutation)

        const user = await advanceToStep2()

        fillInput(screen.getByLabelText('Verification code'), '482913')
        fillInput(screen.getByLabelText('New password'), 'BrandNewPassw0rd!')
        fillInput(screen.getByLabelText('Confirm password'), 'BrandNewPassw0rd!')
        await user.click(screen.getByRole('button', {name: 'Reset password'}))

        await waitFor(() => {
            expect(screen.getByText('Invalid or expired reset code')).toBeInTheDocument()
        })
    })

    it('Verification code and password fields are empty on arrival at step 2 (no value leakage across the remount)', async () => {
        await advanceToStep2()

        expect(screen.getByLabelText('Verification code')).toHaveValue('')
        expect(screen.getByLabelText('New password')).toHaveValue('')
        expect(screen.getByLabelText('Confirm password')).toHaveValue('')
    })
})
