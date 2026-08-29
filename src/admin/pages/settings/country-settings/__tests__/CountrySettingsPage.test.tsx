import {beforeEach, describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {useCountrySettings} from '../hooks/useCountrySettings'
import {CountrySettingsPage} from '../CountrySettingsPage'

const mockCountrySettings = [
    {
        countryCode: 'ZA',
        countryName: 'South Africa',
        currencyCode: 'ZAR',
        locale: 'en-ZA',
        decimalPlaces: 2,
        isDefault: true,
        isActive: true
    },
    {
        countryCode: 'US',
        countryName: 'United States',
        currencyCode: 'USD',
        locale: 'en-US',
        decimalPlaces: 2,
        isDefault: false,
        isActive: false
    },
]

vi.mock('../hooks/useCountrySettings', () => ({
    useCountrySettings: vi.fn(() => ({
        data: mockCountrySettings,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    })),
}))

function renderPage() {
    return render(
        <MemoryRouter initialEntries={['/admin/settings/countries']}>
            <CountrySettingsPage/>
        </MemoryRouter>,
    )
}

describe('CountrySettingsPage', () => {
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
        vi.mocked(useCountrySettings).mockReturnValue({
            data: mockCountrySettings,
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
        } as any)
    })

    describe('data rendering', () => {
        it('renders both country names', () => {
            renderPage()
            expect(screen.getByText('South Africa')).toBeInTheDocument()
            expect(screen.getByText('United States')).toBeInTheDocument()
        })

        it('displays "Default" badge for the default country', () => {
            renderPage()
            // "Default" appears as column header and as badge text for ZA row
            const defaults = screen.getAllByText('Default')
            expect(defaults.length).toBeGreaterThanOrEqual(2)
        })

        it('applies opacity-50 class to inactive country row cells', () => {
            renderPage()
            const usCell = screen.getByText('United States')
            expect(usCell).toHaveClass('opacity-50')
        })

        it('does not apply opacity-50 class to active country row cells', () => {
            renderPage()
            const zaCell = screen.getByText('South Africa')
            expect(zaCell).not.toHaveClass('opacity-50')
        })
    })

    describe('search filtering', () => {
        it('filters the table to countries matching the search text', () => {
            renderPage()

            fireEvent.change(screen.getByPlaceholderText('Search countries...'), {
                target: {value: 'South'},
            })

            expect(screen.getByText('South Africa')).toBeInTheDocument()
            expect(screen.queryByText('United States')).not.toBeInTheDocument()
        })

        it('shows every country again once the search text is cleared', () => {
            renderPage()

            const searchInput = screen.getByPlaceholderText('Search countries...')
            fireEvent.change(searchInput, {target: {value: 'South'}})
            fireEvent.change(searchInput, {target: {value: ''}})

            expect(screen.getByText('South Africa')).toBeInTheDocument()
            expect(screen.getByText('United States')).toBeInTheDocument()
        })
    })

    describe('read-only for all roles', () => {
        it('has no edit, add, or delete buttons as SUPER_ADMIN', () => {
            renderPage()
            expect(screen.queryByText('Edit')).not.toBeInTheDocument()
            expect(screen.queryByText('Add')).not.toBeInTheDocument()
            expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        })

        it('has no edit, add, or delete buttons as VIEWER', () => {
            useAdminAuthStore.setState({
                role: 'VIEWER',
                authority: ['VIEWER'],
                userId: '2',
            })
            renderPage()
            expect(screen.queryByText('Edit')).not.toBeInTheDocument()
            expect(screen.queryByText('Add')).not.toBeInTheDocument()
            expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        })
    })

    describe('query error state', () => {
        beforeEach(() => {
            vi.mocked(useCountrySettings).mockReturnValue({
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
