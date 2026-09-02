import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {AdminLoginPage} from '../AdminLoginPage'

const mockLoginMutate = vi.fn()

vi.mock('@/admin/pages/auth/hooks/useAdminLogin', () => ({
    useAdminLogin: () => ({
        mutate: mockLoginMutate,
        isPending: false,
    }),
}))

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
}

function renderAdminLoginPage() {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/login']}>
                <Routes>
                    <Route path="/admin/login" element={<AdminLoginPage/>}/>
                    <Route path="/admin/dashboard" element={<div>Dashboard</div>}/>
                    <Route path="/admin/forgot-password" element={<div>Forgot password screen</div>}/>
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    )
}

describe('AdminLoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAdminAuthStore.setState({
            isSignedIn: false,
            token: null,
            role: null,
            authority: [],
            userName: null,
            email: null,
            userId: null,
        })
    })

    it('shows rate limit message on 429 response', async () => {
        mockLoginMutate.mockImplementation((_values: unknown, options: { onError: (err: unknown) => void }) => {
            options.onError({response: {status: 429}})
        })

        const user = userEvent.setup()
        renderAdminLoginPage()

        await user.type(screen.getByPlaceholderText('admin@example.com'), 'admin@test.com')
        await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
        await user.click(screen.getByRole('button', {name: 'Sign in'}))

        await waitFor(() => {
            expect(screen.getByText('Too many attempts — please try again later.')).toBeInTheDocument()
        })
    })

    it('does not show invalid credentials message on 429 response', async () => {
        mockLoginMutate.mockImplementation((_values: unknown, options: { onError: (err: unknown) => void }) => {
            options.onError({response: {status: 429}})
        })

        const user = userEvent.setup()
        renderAdminLoginPage()

        await user.type(screen.getByPlaceholderText('admin@example.com'), 'admin@test.com')
        await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
        await user.click(screen.getByRole('button', {name: 'Sign in'}))

        await waitFor(() => {
            expect(screen.getByText('Too many attempts — please try again later.')).toBeInTheDocument()
        })
        expect(screen.queryByText('Invalid email or password.')).not.toBeInTheDocument()
    })

    it('still shows access denied on 403 response', async () => {
        mockLoginMutate.mockImplementation((_values: unknown, options: { onError: (err: unknown) => void }) => {
            options.onError({response: {status: 403}})
        })

        const user = userEvent.setup()
        renderAdminLoginPage()

        await user.type(screen.getByPlaceholderText('admin@example.com'), 'admin@test.com')
        await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
        await user.click(screen.getByRole('button', {name: 'Sign in'}))

        await waitFor(() => {
            expect(screen.getByText('Access denied. Your account is inactive.')).toBeInTheDocument()
        })
    })

    it('shows invalid credentials on other errors', async () => {
        mockLoginMutate.mockImplementation((_values: unknown, options: { onError: (err: unknown) => void }) => {
            options.onError({response: {status: 401}})
        })

        const user = userEvent.setup()
        renderAdminLoginPage()

        await user.type(screen.getByPlaceholderText('admin@example.com'), 'admin@test.com')
        await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
        await user.click(screen.getByRole('button', {name: 'Sign in'}))

        await waitFor(() => {
            expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
        })
    })

    it('shows a "Forgot password?" link that navigates to /admin/forgot-password (Requirement 5.1/5.2)', async () => {
        const user = userEvent.setup()
        renderAdminLoginPage()

        await user.click(screen.getByRole('link', {name: 'Forgot password?'}))

        expect(screen.getByText('Forgot password screen')).toBeInTheDocument()
    })

    it('tells the user they are rate limited rather than that their password was wrong', async () => {
        const mockError = {response: {status: 429}}

        mockLoginMutate.mockImplementation((_values: unknown, options: { onError: (err: unknown) => void }) => {
            options.onError(mockError)
        })

        const user = userEvent.setup()
        renderAdminLoginPage()

        await user.type(screen.getByPlaceholderText('admin@example.com'), 'admin@test.com')
        await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
        await user.click(screen.getByRole('button', {name: 'Sign in'}))

        // A 429 is a distinct branch from a bad credential: telling the user their
        // password was wrong when they are merely throttled sends them to reset it.
        await waitFor(() => {
            expect(screen.getByText('Too many attempts — please try again later.')).toBeInTheDocument()
        })
    })
})
