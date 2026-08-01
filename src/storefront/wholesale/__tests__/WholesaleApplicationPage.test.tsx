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

vi.mock('../hooks/useWholesaleApplicationSubmit', () => ({
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

    describe('intro copy renders', () => {
        it('displays the application process explanation paragraph', () => {
            renderPage()

            expect(screen.getByText(/To apply for a wholesale account, please complete the application form below/)).toBeInTheDocument()
            expect(screen.getByText(/Once your application is approved, you will be able to log in and wholesale pricing will be used/)).toBeInTheDocument()
        })

        it('displays the normal account guidance paragraph', () => {
            renderPage()

            expect(screen.getByText(/You need a normal website account first/)).toBeInTheDocument()
            expect(screen.getByText(/When your wholesale application is approved, your existing account will be upgraded/)).toBeInTheDocument()
        })

        it('links to /account/register for creating a normal account', () => {
            renderPage()

            const link = screen.getByRole('link', {name: /create a normal account/i})
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', '/account/register')
        })
    })

    describe('all form fields render', () => {
        it('renders all form sections and the submit button', () => {
            renderPage()

            expect(screen.getByText('Applicant Details')).toBeInTheDocument()
            expect(screen.getByText('Company Details')).toBeInTheDocument()
            expect(screen.getByText('Company Address')).toBeInTheDocument()
            expect(screen.getByText('Delivery Address (if different from company address)')).toBeInTheDocument()
            expect(screen.getByText('Financial / Accounts Contact')).toBeInTheDocument()
            expect(screen.getByText('Purchase Orders')).toBeInTheDocument()
            expect(screen.getByText('Additional Notes')).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Submit Application'})).toBeInTheDocument()
        })

        it('renders applicant fields: firstName, lastName, applicantEmail, accountEmail, phone', () => {
            renderPage()

            expect(screen.getByLabelText(/^First Name/)).toBeInTheDocument()
            expect(screen.getByLabelText(/^Last Name/)).toBeInTheDocument()
            expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Existing website account email/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/^Phone/)).toBeInTheDocument()
        })

        it('renders company fields: companyName, tradingName, companyPhone, companyEmail, vatNumber, regNumber', () => {
            renderPage()

            expect(screen.getByLabelText(/Company Name/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Trading name/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Company phone/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Company email/)).toBeInTheDocument()
            expect(screen.getByLabelText(/VAT Number/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Registration Number/)).toBeInTheDocument()
        })

        it('renders finance contact fields: financeContactName, financeContactEmail, financeContactPhone', () => {
            renderPage()

            expect(screen.getByLabelText(/Financial \/ accounts contact name/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/Financial \/ accounts email/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/Financial \/ accounts phone/i)).toBeInTheDocument()
        })

        it('renders purchaseOrderRequired toggle', () => {
            renderPage()

            expect(screen.getByText(/Do you require purchase orders/)).toBeInTheDocument()
        })
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
        expect(mockMutate).not.toHaveBeenCalled()
    })

    it('shows success state on mutation success', async () => {
        mockMutate.mockImplementation((_data, options) => {
            options?.onSuccess?.()
        })

        const user = userEvent.setup()
        renderPage()

        // Fill required applicant fields
        await user.type(screen.getByLabelText(/^First Name/), 'John')
        await user.type(screen.getByLabelText(/^Last Name/), 'Doe')
        await user.type(screen.getByLabelText(/^Email/), 'john@example.com')
        await user.type(screen.getByLabelText(/^Phone/), '0821234567')

        // Fill required company fields
        await user.type(screen.getByLabelText(/Company Name/), 'Acme Ltd')

        // Fill required physical address fields
        await user.type(screen.getByLabelText('Address Line 1*'), '123 Main St')
        await user.type(screen.getByLabelText('City*'), 'Johannesburg')
        await user.type(screen.getByLabelText('Province*'), 'Gauteng')
        await user.type(screen.getByLabelText('Postal Code*'), '2196')

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
        await user.type(screen.getByLabelText(/^First Name/), 'John')
        await user.type(screen.getByLabelText(/^Last Name/), 'Doe')
        await user.type(screen.getByLabelText(/^Email/), 'john@example.com')
        await user.type(screen.getByLabelText(/^Phone/), '0821234567')
        await user.type(screen.getByLabelText(/Company Name/), 'Acme Ltd')
        await user.type(screen.getByLabelText('Address Line 1*'), '123 Main St')
        await user.type(screen.getByLabelText('City*'), 'Johannesburg')
        await user.type(screen.getByLabelText('Province*'), 'Gauteng')
        await user.type(screen.getByLabelText('Postal Code*'), '2196')

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
