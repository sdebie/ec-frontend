import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type {UserEvent} from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {MemoryRouter} from 'react-router-dom'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
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

async function clickNext(user: UserEvent) {
    await user.click(screen.getByRole('button', {name: 'Next'}))
}

/** Fills the required fields of the Your-details step (step 1). */
async function fillApplicantStep(user: UserEvent) {
    await user.type(screen.getByLabelText(/^First Name/), 'John')
    await user.type(screen.getByLabelText(/^Last Name/), 'Doe')
    await user.type(screen.getByLabelText(/^Email/), 'john@example.com')
    await user.type(screen.getByLabelText(/^Phone/), '0821234567')
}

/** Fills the required fields of the Company step (step 2). */
async function fillCompanyStep(user: UserEvent) {
    await user.type(screen.getByLabelText(/Company Name/), 'Acme Ltd')
}

/** Fills the required fields of the Addresses step (step 3). */
async function fillAddressStep(user: UserEvent) {
    await user.type(screen.getByLabelText('Address Line 1*'), '123 Main St')
    await user.type(screen.getByLabelText('City*'), 'Johannesburg')
    await user.type(screen.getByLabelText('Province*'), 'Gauteng')
    await user.type(screen.getByLabelText('Postal Code*'), '2196')
}

/** Walks the wizard to the final (review) step with all required fields filled. */
async function walkToFinalStep(user: UserEvent) {
    await fillApplicantStep(user)
    await clickNext(user)
    await fillCompanyStep(user)
    await clickNext(user)
    await fillAddressStep(user)
    await clickNext(user)
    // Finance step: all fields optional, advance straight through.
    await clickNext(user)
}

describe('WholesaleApplicationPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockState = {mutate: mockMutate, isPending: false}
        // scrollIntoView is not implemented in jsdom
        Element.prototype.scrollIntoView = vi.fn()
    })

    afterEach(() => {
        useCustomerAuthStore.setState({token: null, email: null, firstName: null, customerType: 'RETAIL'})
    })

    describe('intro copy renders', () => {
        it('displays the condensed subtitle with the review turnaround', () => {
            renderPage()

            expect(screen.getByText(/Apply for wholesale pricing in five quick steps/)).toBeInTheDocument()
            expect(screen.getByText(/reviewed within 2–3 business days/)).toBeInTheDocument()
        })

        it('explains account linking beside the account email field for signed-out visitors', () => {
            renderPage()

            expect(screen.getByText(/Your application is linked to a website account when approved/)).toBeInTheDocument()
        })

        it('links to /account/register for creating a normal account', () => {
            renderPage()

            const link = screen.getByRole('link', {name: /create a normal account/i})
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', '/account/register')
        })
    })

    describe('account email prefill', () => {
        it('prefills the account email from the signed-in customer session', () => {
            useCustomerAuthStore.setState({token: 'jwt', email: 'signed.in@example.com'})
            renderPage()

            expect(screen.getByLabelText(/Website account email/)).toHaveValue('signed.in@example.com')
            expect(screen.getByText(/Linked to your signed-in account/)).toBeInTheDocument()
        })

        it('leaves the account email empty for anonymous visitors', () => {
            renderPage()

            expect(screen.getByLabelText(/Website account email/)).toHaveValue('')
        })
    })

    describe('wizard structure', () => {
        it('renders the progress stepper with all five journey steps', () => {
            renderPage()

            expect(screen.getByRole('navigation', {name: 'Progress'})).toBeInTheDocument()
            expect(screen.getByText('Your details')).toBeInTheDocument()
            expect(screen.getByText('Company')).toBeInTheDocument()
            expect(screen.getByText('Addresses')).toBeInTheDocument()
            expect(screen.getByText('Finance')).toBeInTheDocument()
            expect(screen.getByText('Review')).toBeInTheDocument()
        })

        it('starts on the applicant step with its fields, a step counter, and no submit button', () => {
            renderPage()

            expect(screen.getByText('Applicant Details')).toBeInTheDocument()
            expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
            expect(screen.getByLabelText(/^First Name/)).toBeInTheDocument()
            expect(screen.getByLabelText(/^Last Name/)).toBeInTheDocument()
            expect(screen.getByLabelText(/^Email/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Website account email/)).toBeInTheDocument()
            expect(screen.getByLabelText(/^Phone/)).toBeInTheDocument()
            expect(screen.queryByText('Company Details')).not.toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'Submit Application'})).not.toBeInTheDocument()
        })

        it('walks through every step, showing each step\'s sections and the review summary', async () => {
            const user = userEvent.setup()
            renderPage()

            await fillApplicantStep(user)
            await clickNext(user)
            expect(screen.getByText('Company Details')).toBeInTheDocument()
            expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
            expect(screen.getByLabelText(/Trading name/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Company phone/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Company email/)).toBeInTheDocument()
            expect(screen.getByLabelText(/VAT Number/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Registration Number/)).toBeInTheDocument()

            await fillCompanyStep(user)
            await clickNext(user)
            expect(screen.getByText('Company Address')).toBeInTheDocument()
            expect(screen.getByText('Delivery address')).toBeInTheDocument()
            // Defaults to using the company address: delivery fields visible but disabled.
            expect(screen.getByRole('checkbox', {name: 'Use company address for delivery'})).toBeChecked()
            expect(screen.getByLabelText('Address Line 1')).toBeDisabled()

            await fillAddressStep(user)
            // Disabled delivery fields live-mirror the company address just typed.
            expect(screen.getByLabelText('Address Line 1')).toHaveValue('123 Main St')
            expect(screen.getByLabelText('City')).toHaveValue('Johannesburg')
            await clickNext(user)
            // Finance step: sections shown, no submit yet.
            expect(screen.getByText('Step 4 of 5')).toBeInTheDocument()
            expect(screen.getByText('Financial / Accounts Contact')).toBeInTheDocument()
            expect(screen.getByText('Purchase Orders')).toBeInTheDocument()
            expect(screen.getByText('Additional Notes')).toBeInTheDocument()
            expect(screen.queryByRole('button', {name: 'Submit Application'})).not.toBeInTheDocument()

            await user.type(screen.getByLabelText(/Financial \/ accounts contact name/i), 'Fran Finance')
            await clickNext(user)
            // Review step: summary reflects entered values, with edit jumps per group.
            expect(screen.getByText('Step 5 of 5')).toBeInTheDocument()
            expect(screen.getByText('Review your details')).toBeInTheDocument()
            expect(screen.getByText(/John Doe · john@example\.com · 0821234567/)).toBeInTheDocument()
            expect(screen.getByText('Acme Ltd')).toBeInTheDocument()
            expect(screen.getByText(/123 Main St · Johannesburg · 2196/)).toBeInTheDocument()
            expect(screen.getByText('Fran Finance')).toBeInTheDocument()
            expect(screen.getByText('Not required')).toBeInTheDocument()
            expect(screen.getAllByRole('button', {name: 'Edit'})).toHaveLength(5)
            expect(screen.getByRole('button', {name: 'Submit Application'})).toBeInTheDocument()
        })

        it('toggling "Use company address for delivery" switches between mirrored-disabled and editable fields', async () => {
            const user = userEvent.setup()
            renderPage()

            await fillApplicantStep(user)
            await clickNext(user)
            await fillCompanyStep(user)
            await clickNext(user)
            await fillAddressStep(user)

            // Scoped to the Delivery section: editable delivery labels carry the same
            // required asterisks as the company address, so global exact queries collide.
            const delivery = () =>
                within(screen.getByText('Delivery address').closest('section') as HTMLElement)

            // Checked (default): disabled and mirroring the company address (no asterisk while read-only).
            expect(delivery().getByLabelText('Address Line 1')).toBeDisabled()
            expect(delivery().getByLabelText('Address Line 1')).toHaveValue('123 Main St')

            // Unchecked: editable and required, holding the (empty) delivery values, not the mirror.
            await user.click(screen.getByRole('checkbox', {name: 'Use company address for delivery'}))
            expect(delivery().getByLabelText('Address Line 1*')).toBeEnabled()
            expect(delivery().getByLabelText('Address Line 1*')).toHaveValue('')

            // A typed delivery address survives a round trip through the mirror.
            await user.type(delivery().getByLabelText('Address Line 1*'), '789 Depot Rd')
            await user.click(screen.getByRole('checkbox', {name: 'Use company address for delivery'}))
            expect(delivery().getByLabelText('Address Line 1')).toBeDisabled()
            expect(delivery().getByLabelText('Address Line 1')).toHaveValue('123 Main St')
            await user.click(screen.getByRole('checkbox', {name: 'Use company address for delivery'}))
            expect(delivery().getByLabelText('Address Line 1*')).toHaveValue('789 Depot Rd')
        })

        it('requires the delivery address when not using the company address', async () => {
            const user = userEvent.setup()
            renderPage()

            await fillApplicantStep(user)
            await clickNext(user)
            await fillCompanyStep(user)
            await clickNext(user)
            await fillAddressStep(user)

            await user.click(screen.getByRole('checkbox', {name: 'Use company address for delivery'}))
            await clickNext(user)

            // Company address is filled, so these errors can only be the delivery fields'.
            await waitFor(() => {
                expect(screen.getByText('Address line 1 is required')).toBeInTheDocument()
            })
            expect(screen.getByText('City is required')).toBeInTheDocument()
            expect(screen.getByText('Province is required')).toBeInTheDocument()
            expect(screen.getByText('Postal code is required')).toBeInTheDocument()
            expect(screen.queryByText('Financial / Accounts Contact')).not.toBeInTheDocument()

            // Filling the delivery address clears the block.
            const delivery = () =>
                within(screen.getByText('Delivery address').closest('section') as HTMLElement)
            await user.type(delivery().getByLabelText('Address Line 1*'), '789 Depot Rd')
            await user.type(delivery().getByLabelText('City*'), 'Durban')
            await user.type(delivery().getByLabelText('Province*'), 'KwaZulu-Natal')
            await user.type(delivery().getByLabelText('Postal Code*'), '4001')
            await clickNext(user)

            expect(screen.getByText('Financial / Accounts Contact')).toBeInTheDocument()
        })

        it('Edit on the review summary jumps back to the owning step', async () => {
            const user = userEvent.setup()
            renderPage()

            await walkToFinalStep(user)
            await user.click(screen.getAllByRole('button', {name: 'Edit'})[1])

            expect(screen.getByText('Company Details')).toBeInTheDocument()
            expect(screen.getByLabelText(/Company Name/)).toHaveValue('Acme Ltd')
        })

        it('Back returns to the previous step with entered values preserved', async () => {
            const user = userEvent.setup()
            renderPage()

            await fillApplicantStep(user)
            await clickNext(user)
            expect(screen.getByText('Company Details')).toBeInTheDocument()

            await user.click(screen.getByRole('button', {name: 'Back'}))

            expect(screen.getByText('Applicant Details')).toBeInTheDocument()
            expect(screen.getByLabelText(/^First Name/)).toHaveValue('John')
        })
    })

    describe('per-step validation', () => {
        it('Next blocks on the applicant step with empty required fields', async () => {
            const user = userEvent.setup()
            renderPage()

            await clickNext(user)

            await waitFor(() => {
                expect(screen.getByText('First name is required')).toBeInTheDocument()
            })
            expect(screen.getByText('Last name is required')).toBeInTheDocument()
            expect(screen.getByText('Phone number is required')).toBeInTheDocument()
            // Still on step 1; never advanced, never submitted.
            expect(screen.queryByText('Company Details')).not.toBeInTheDocument()
            expect(mockMutate).not.toHaveBeenCalled()
        })

        it('Next blocks on the company step when the company name is empty', async () => {
            const user = userEvent.setup()
            renderPage()

            await fillApplicantStep(user)
            await clickNext(user)
            await clickNext(user)

            await waitFor(() => {
                expect(screen.getByText('Company name is required')).toBeInTheDocument()
            })
            expect(screen.queryByText('Company Address')).not.toBeInTheDocument()
        })
    })

    it('shows success state on mutation success', async () => {
        mockMutate.mockImplementation((_data, options) => {
            options?.onSuccess?.()
        })

        const user = userEvent.setup()
        renderPage()

        await walkToFinalStep(user)
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

        await walkToFinalStep(user)
        await user.click(screen.getByRole('button', {name: 'Submit Application'}))

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalled()
        })

        // Form should still be visible and interactive (no success state)
        expect(screen.queryByText('Application submitted')).not.toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Submit Application'})).toBeEnabled()
    })

    it('submit button is disabled during submission', async () => {
        mockState = {mutate: mockMutate, isPending: true}
        const user = userEvent.setup()
        renderPage()

        await walkToFinalStep(user)

        const button = screen.getByRole('button', {name: 'Submitting...'})
        expect(button).toBeDisabled()
    })
})
