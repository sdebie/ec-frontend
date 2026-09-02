import {beforeEach, describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {useShippingMethods} from '../hooks/useShippingMethods'
import {ShippingMethodsPage} from '../ShippingMethodsPage'

const mockShippingMethods = [
    {id: '1', name: 'Standard Delivery', baseFee: 5000, active: true, estimatedDays: '3-5 business days'},
    {id: '2', name: 'Express Delivery', baseFee: 15000, active: false, estimatedDays: '1-2 business days'},
]

vi.mock('../hooks/useShippingMethods', () => ({
    useShippingMethods: vi.fn(() => ({
        data: mockShippingMethods,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    })),
}))

vi.mock('@/shared/utils/formatAmount', () => ({
    formatAmount: vi.fn((val: number) => `R ${(val / 100).toFixed(2)}`),
}))

vi.mock('../components/ShippingMethodDialog', () => ({
    ShippingMethodDialog: () => null,
}))

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/admin/settings/shipping']}>
            <ShippingMethodsPage/>
        </MemoryRouter>,
    )
}

describe('ShippingMethodsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAdminAuthStore.setState({
            isSignedIn: true,
            token: 'test-token',
            role: 'SUPER_ADMIN',
            authority: ['SUPER_ADMIN'],
            userName: 'Admin',
            email: 'admin@test.com',
            userId: '1',
        })
        vi.mocked(useShippingMethods).mockReturnValue({
            data: mockShippingMethods,
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as any)
    })

    describe('SUPER_ADMIN role', () => {
        it('renders the "Shipping Methods" heading', () => {
            renderPage()
            expect(screen.getByText('Shipping Methods')).toBeInTheDocument()
        })

        it('shows the "Add shipping method" button', () => {
            renderPage()
            expect(screen.getByText('Add shipping method')).toBeInTheDocument()
        })

        it('shows the "Actions" column header', () => {
            renderPage()
            expect(screen.getByText('Actions')).toBeInTheDocument()
        })

        it('renders both shipping method names', () => {
            renderPage()
            expect(screen.getByText('Standard Delivery')).toBeInTheDocument()
            expect(screen.getByText('Express Delivery')).toBeInTheDocument()
        })
    })

    describe('search filtering', () => {
        it('filters the table to methods matching the search text', () => {
            renderPage()

            fireEvent.change(screen.getByPlaceholderText('Search shipping methods...'), {
                target: {value: 'Express'},
            })

            expect(screen.getByText('Express Delivery')).toBeInTheDocument()
            expect(screen.queryByText('Standard Delivery')).not.toBeInTheDocument()
        })

        it('shows every method again once the search text is cleared', () => {
            renderPage()

            const searchInput = screen.getByPlaceholderText('Search shipping methods...')
            fireEvent.change(searchInput, {target: {value: 'Express'}})
            fireEvent.change(searchInput, {target: {value: ''}})

            expect(screen.getByText('Standard Delivery')).toBeInTheDocument()
            expect(screen.getByText('Express Delivery')).toBeInTheDocument()
        })
    })

    describe('VIEWER role', () => {
        beforeEach(() => {
            useAdminAuthStore.setState({
                role: 'VIEWER',
                authority: ['VIEWER'],
                userId: '2',
            })
        })

        it('hides the "Add shipping method" button', () => {
            renderPage()
            expect(screen.queryByText('Add shipping method')).not.toBeInTheDocument()
        })

        it('hides the "Actions" column', () => {
            renderPage()
            expect(screen.queryByText('Actions')).not.toBeInTheDocument()
        })
    })

    describe('query error state', () => {
        beforeEach(() => {
            vi.mocked(useShippingMethods).mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                refetch: vi.fn(),
            } as any)
        })

        it('shows error message when query fails', () => {
            renderPage()
            expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
        })
    })
})
