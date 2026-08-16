import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {FormPageNotFound} from '../FormPageNotFound'

describe('FormPageNotFound', () => {
    it('renders the entity-specific not-found message', () => {
        render(
            <MemoryRouter>
                <FormPageNotFound entityName="Brand" backHref="/admin/products/brands" backLabel="Back to Brands"/>
            </MemoryRouter>,
        )

        expect(screen.getByText('Not Found')).toBeInTheDocument()
        expect(screen.getByText('Brand not found')).toBeInTheDocument()
    })

    it('links back using the given href and label', () => {
        render(
            <MemoryRouter>
                <FormPageNotFound entityName="Order" backHref="/admin/orders" backLabel="Back to orders"/>
            </MemoryRouter>,
        )

        const link = screen.getByRole('link', {name: 'Back to orders'})
        expect(link).toHaveAttribute('href', '/admin/orders')
    })
})
