import {beforeEach, describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {useShippingMethods} from '../../hooks/useShippingMethods'
import {useSaveShippingMethod} from '../../hooks/useSaveShippingMethod'
import {ShippingMethodsPage} from '../../ShippingMethodsPage'

const standardDelivery = {
    id: '1',
    name: 'Standard Delivery',
    baseFee: 5000,
    active: true,
    estimatedDays: '3-5 business days',
    requiresAddress: true,
}
const expressDelivery = {
    id: '2',
    name: 'Express Delivery',
    baseFee: 15000,
    active: false,
    estimatedDays: '1-2 business days',
    requiresAddress: true,
}

vi.mock('../../hooks/useShippingMethods', () => ({
    useShippingMethods: vi.fn(() => ({
        data: [standardDelivery, expressDelivery],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    })),
}))

vi.mock('../../hooks/useSaveShippingMethod', () => ({
    useSaveShippingMethod: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
}))

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/admin/settings/shipping']}>
            <ShippingMethodsPage/>
        </MemoryRouter>,
    )
}

describe('ShippingMethodDialog defaultValues re-initialization', () => {
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
            data: [standardDelivery, expressDelivery],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as any)
        vi.mocked(useSaveShippingMethod).mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
        } as any)
    })

    it('shows the correct method values when reopened for a different method after being closed', () => {
        renderPage()

        fireEvent.click(screen.getByLabelText('Edit Standard Delivery'))
        expect(screen.getByLabelText(/^name/i)).toHaveValue('Standard Delivery')

        fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        fireEvent.click(screen.getByLabelText('Edit Express Delivery'))
        expect(screen.getByLabelText(/^name/i)).toHaveValue('Express Delivery')
        expect(screen.getByLabelText(/^estimated days/i)).toHaveValue('1-2 business days')
    })
})
