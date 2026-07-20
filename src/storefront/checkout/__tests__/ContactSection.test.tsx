import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {FormProvider, useForm} from 'react-hook-form'
import {MemoryRouter} from 'react-router-dom'
import {ContactSection} from '../components/ContactSection'
import type {CheckoutFormValues} from '../checkoutFormSchema'

// --- Helpers ---

interface WrapperProps {
    isAuthenticated: boolean
    customerProfile: { email: string; firstName: string; lastName: string } | null
    defaultValues?: Partial<CheckoutFormValues>
}

function TestWrapper({isAuthenticated, customerProfile, defaultValues}: WrapperProps) {
    const methods = useForm<CheckoutFormValues>({
        defaultValues: {
            email: customerProfile?.email ?? '',
            firstName: customerProfile?.firstName ?? '',
            lastName: customerProfile?.lastName ?? '',
            shippingMethodId: '',
            paymentMethod: '',
            ...defaultValues,
        },
    })

    return (
        <FormProvider {...methods}>
            <MemoryRouter>
                <ContactSection
                    control={methods.control}
                    isAuthenticated={isAuthenticated}
                    customerProfile={customerProfile}
                />
            </MemoryRouter>
        </FormProvider>
    )
}

// --- Tests ---

describe('ContactSection', () => {
    describe('authenticated user', () => {
        const customerProfile = {
            email: 'jane@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
        }

        it('displays "Logged in as" text with customer email', () => {
            render(
                <TestWrapper isAuthenticated={true} customerProfile={customerProfile}/>
            )

            expect(
                screen.getByText(`Logged in as ${customerProfile.email}`)
            ).toBeInTheDocument()
        })

        it('renders email, firstName, and lastName fields as read-only', () => {
            render(
                <TestWrapper isAuthenticated={true} customerProfile={customerProfile}/>
            )

            const emailInput = screen.getByLabelText(/email address/i)
            const firstNameInput = screen.getByLabelText(/first name/i)
            const lastNameInput = screen.getByLabelText(/last name/i)

            expect(emailInput).toHaveAttribute('readonly')
            expect(firstNameInput).toHaveAttribute('readonly')
            expect(lastNameInput).toHaveAttribute('readonly')
        })

        it('pre-fills fields with customer profile data', () => {
            render(
                <TestWrapper isAuthenticated={true} customerProfile={customerProfile}/>
            )

            expect(screen.getByLabelText(/email address/i)).toHaveValue(customerProfile.email)
            expect(screen.getByLabelText(/first name/i)).toHaveValue(customerProfile.firstName)
            expect(screen.getByLabelText(/last name/i)).toHaveValue(customerProfile.lastName)
        })

        it('hides "Have an account? Sign in" link', () => {
            render(
                <TestWrapper isAuthenticated={true} customerProfile={customerProfile}/>
            )

            expect(screen.queryByText(/have an account\?/i)).not.toBeInTheDocument()
            expect(screen.queryByRole('link', {name: /sign in/i})).not.toBeInTheDocument()
        })

        it('hides "Create an account" link', () => {
            render(
                <TestWrapper isAuthenticated={true} customerProfile={customerProfile}/>
            )

            expect(screen.queryByRole('link', {name: /create an account/i})).not.toBeInTheDocument()
        })
    })

    describe('guest user', () => {
        it('renders email, firstName, and lastName fields as editable (not read-only)', () => {
            render(
                <TestWrapper isAuthenticated={false} customerProfile={null}/>
            )

            const emailInput = screen.getByLabelText(/email address/i)
            const firstNameInput = screen.getByLabelText(/first name/i)
            const lastNameInput = screen.getByLabelText(/last name/i)

            expect(emailInput).not.toHaveAttribute('readonly')
            expect(firstNameInput).not.toHaveAttribute('readonly')
            expect(lastNameInput).not.toHaveAttribute('readonly')
        })

        it('shows "Have an account? Sign in" link', () => {
            render(
                <TestWrapper isAuthenticated={false} customerProfile={null}/>
            )

            expect(screen.getByText(/have an account\?/i)).toBeInTheDocument()
            const signInLink = screen.getByRole('link', {name: /sign in/i})
            expect(signInLink).toBeInTheDocument()
            expect(signInLink).toHaveAttribute('href', '/account/login')
        })

        it('shows "Create an account" link', () => {
            render(
                <TestWrapper isAuthenticated={false} customerProfile={null}/>
            )

            const createLink = screen.getByRole('link', {name: /create an account/i})
            expect(createLink).toBeInTheDocument()
            expect(createLink).toHaveAttribute('href', '/register')
        })

        it('does not display "Logged in as" text', () => {
            render(
                <TestWrapper isAuthenticated={false} customerProfile={null}/>
            )

            expect(screen.queryByText(/logged in as/i)).not.toBeInTheDocument()
        })
    })
})
