import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import {WholesaleApplicationPage} from '../WholesaleApplicationPage.tsx'

const mockMutate = vi.fn()
let mockState: { mutate: typeof mockMutate; isPending: boolean } = {
    mutate: mockMutate,
    isPending: false,
}

vi.mock('./useWholesaleApplicationSubmit', () => ({
    useWholesaleApplicationSubmit: () => mockState,
}))

function renderPage() {
    return render(
        <MemoryRouter>
            <WholesaleApplicationPage/>
        </MemoryRouter>,
    )
}

describe('WholesaleApplicationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockState = {mutate: mockMutate, isPending: false}
        // scrollIntoView is not implemented in jsdom
        Element.prototype.scrollIntoView = vi.fn()
    })

    it('renders all form sections and the submit button', () => {
        renderPage()

        expect(screen.getByText('Applicant Details')).toBeInTheDocument()
        expect(screen.getByText('Company Details')).toBeInTheDocument()
        expect(screen.getByText('Physical Address')).toBeInTheDocument()
        expect(screen.getByText('Postal Address')).toBeInTheDocument()
        expect(screen.getByText('Additional Notes')).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Submit Application'})).toBeInTheDocument()
    })

    it('required field validation blocks submit', async () => {
        const user = userEvent.setup()
        renderPage()

        await user.click(screen.getByRole('button', {name: 'Submit Application'}))

        await waitFor(() => {
            expect(screen.getByText('First name is required')).toBeInTheDocument()
        })

        expect(screen.getByText('Last name is required')).toBeInTheDocument()
        expect(screen.getByText('Phone number is required')).toBeInTheDocument()
        expect(screen.getByText('Company name is required')).toBeInTheDocument()
        expect(screen.getByText('Registration number is required')).toBeInTheDocument()
        expect(mockMutate).not.toHaveBeenCalled()
    })

    it('shows success state on mutation success', async () => {
        mockMutate.mockImplementation((_data, options) => {
            options?.onSuccess?.()
        })

        const user = userEvent.setup()
        renderPage()

        // Fill required applicant fields
        await user.type(screen.getByLabelText(/first name/i), 'John')
        await user.type(screen.getByLabelText(/last name/i), 'Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/phone/i), '0821234567')

        // Fill required company fields
        await user.type(screen.getByLabelText(/company name/i), 'Acme Ltd')
        await user.type(screen.getByLabelText(/registration number/i), 'REG123')

        // Fill required physical address fields
        await user.type(screen.getByLabelText('Address Line 1 *'), '123 Main St')
        await user.type(screen.getByLabelText('Suburb *'), 'Sandton')
        await user.type(screen.getByLabelText('City *'), 'Johannesburg')
        await user.type(screen.getByLabelText('Province *'), 'Gauteng')
        await user.type(screen.getByLabelText('Postal Code *'), '2196')

        await user.click(screen.getByRole('button', {name: 'Submit Application'}))

        await waitFor(() => {
            expect(screen.getByText('Application submitted')).toBeInTheDocument()
        })

        // Form should no longer be visible
        expect(screen.queryByRole('button', {name: 'Submit Application'})).not.toBeInTheDocument()
    })

    it('form remains interactive after mutation error (mutate does not call onSuccess)', async () => {
        mockMutate.mockImplementation(() => {
            // Simulate error: mutate is called but onSuccess is never invoked
        })

        const user = userEvent.setup()
        renderPage()

        // Fill required fields
        await user.type(screen.getByLabelText(/first name/i), 'John')
        await user.type(screen.getByLabelText(/last name/i), 'Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/phone/i), '0821234567')
        await user.type(screen.getByLabelText(/company name/i), 'Acme Ltd')
        await user.type(screen.getByLabelText(/registration number/i), 'REG123')
        await user.type(screen.getByLabelText('Address Line 1 *'), '123 Main St')
        await user.type(screen.getByLabelText('Suburb *'), 'Sandton')
        await user.type(screen.getByLabelText('City *'), 'Johannesburg')
        await user.type(screen.getByLabelText('Province *'), 'Gauteng')
        await user.type(screen.getByLabelText('Postal Code *'), '2196')

        await user.click(screen.getByRole('button', {name: 'Submit Application'}))

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalled()
        })

        // Form should still be visible and interactive (no success state)
        expect(screen.queryByText('Application submitted')).not.toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Submit Application'})).toBeEnabled()
    })

    it('submit button is disabled during submission', () => {
        mockState = {mutate: mockMutate, isPending: true}
        renderPage()

        const button = screen.getByRole('button', {name: 'Submitting...'})
        expect(button).toBeDisabled()
    })
})
