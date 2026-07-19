import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {CustomerLoginForm} from '../CustomerLoginForm'

const mockLoginMutate = vi.fn()
const mockGoogleLoginMutate = vi.fn()

let mockLoginState: {
    mutate: typeof mockLoginMutate
    isPending: boolean
    isError: boolean
    error: unknown
} = {
    mutate: mockLoginMutate,
    isPending: false,
    isError: false,
    error: null,
}

vi.mock('@/storefront/customer/auth/hooks/useCustomerLogin', () => ({
    useCustomerLogin: () => mockLoginState,
}))

vi.mock('@/storefront/customer/auth/hooks/useCustomerGoogleLogin', () => ({
    useCustomerGoogleLogin: () => ({
        mutate: mockGoogleLoginMutate,
    }),
}))

vi.mock('@react-oauth/google', () => ({
    GoogleLogin: ({onSuccess}: { onSuccess: (response: { credential: string }) => void }) => (
        <button
            data-testid="google-login-button"
            onClick={() => onSuccess({credential: 'mock-google-token'})}
        >
            Sign in with Google
        </button>
    ),
}))

describe('CustomerLoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockLoginState = {
            mutate: mockLoginMutate,
            isPending: false,
            isError: false,
            error: null,
        }
    })

    it('renders email input, password input, and Google OAuth button', () => {
        render(<CustomerLoginForm/>)

        expect(screen.getByLabelText('Email address')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByTestId('google-login-button')).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Sign in'})).toBeInTheDocument()
    })

    it('does not render "Forgot password" link when onForgotPassword is not provided', () => {
        render(<CustomerLoginForm/>)

        expect(screen.queryByRole('button', {name: /forgot password/i})).not.toBeInTheDocument()
    })

    it('renders "Forgot password" link and calls callback when provided', async () => {
        const onForgotPassword = vi.fn()
        const user = userEvent.setup()

        render(<CustomerLoginForm onForgotPassword={onForgotPassword}/>)

        const forgotButton = screen.getByRole('button', {name: /forgot password/i})
        expect(forgotButton).toBeInTheDocument()

        await user.click(forgotButton)
        expect(onForgotPassword).toHaveBeenCalledTimes(1)
    })

    it('submit calls useCustomerLogin with correct credentials', async () => {
        const user = userEvent.setup()

        render(<CustomerLoginForm/>)

        await user.type(screen.getByLabelText('Email address'), 'test@example.com')
        await user.type(screen.getByLabelText('Password'), 'password123')
        await user.click(screen.getByRole('button', {name: 'Sign in'}))

        await waitFor(() => {
            expect(mockLoginMutate).toHaveBeenCalledWith(
                {email: 'test@example.com', password: 'password123'},
                expect.objectContaining({onSuccess: expect.any(Function)}),
            )
        })
    })

    it('shows invalid credentials error on 401 response', () => {
        mockLoginState = {
            mutate: mockLoginMutate,
            isPending: false,
            isError: true,
            error: {response: {status: 401}},
        }

        render(<CustomerLoginForm/>)

        expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
    })

    it('shows account status error on 400 response with PENDING status', () => {
        mockLoginState = {
            mutate: mockLoginMutate,
            isPending: false,
            isError: true,
            error: {response: {status: 400, data: {status: 'PENDING'}}},
        }

        render(<CustomerLoginForm/>)

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Your account is not active. Please contact support.',
        )
    })

    it('shows rate limit message on 429 response', () => {
        mockLoginState = {
            mutate: mockLoginMutate,
            isPending: false,
            isError: true,
            error: {response: {status: 429}},
        }

        render(<CustomerLoginForm/>)

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Too many attempts — please try again later.',
        )
    })

    it('does not show invalid credentials message on 429 response', () => {
        mockLoginState = {
            mutate: mockLoginMutate,
            isPending: false,
            isError: true,
            error: {response: {status: 429}},
        }

        render(<CustomerLoginForm/>)

        expect(screen.getByRole('alert')).not.toHaveTextContent('Invalid email or password.')
    })
})
