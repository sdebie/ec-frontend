import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {VariantFields} from '../VariantFields'
import {productSchema, type ProductFormValues} from '../ProductForm'

function makeVariants(count: number, overrides: Record<number, Partial<ProductFormValues['variants'][number]>> = {}) {
    return Array.from({length: count}, (_, i) => ({
        id: `var-${i}`,
        sku: `SKU-${String(i).padStart(3, '0')}`,
        price: '10.00',
        stock: i,
        attributes: [],
        ...overrides[i],
    }))
}

function Wrapper({variants}: {variants: ProductFormValues['variants']}) {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: 'Paged product',
            slug: 'paged-product',
            shortDescription: '',
            description: '',
            status: 'ACTIVE',
            categoryIds: ['cat-1'],
            images: [],
            imageIds: {},
            variants,
        },
    })
    const {fields, append, remove} = useFieldArray({control: form.control, name: 'variants'})
    return (
        <form onSubmit={form.handleSubmit(vi.fn())}>
            <VariantFields control={form.control} fields={fields} append={append} remove={remove}/>
            <button type="submit">Save</button>
        </form>
    )
}

describe('VariantFields — pagination', () => {
    it('shows no pager at 10 variants or fewer', () => {
        render(<Wrapper variants={makeVariants(10)}/>)

        expect(screen.queryByText(/Page 1 of/)).not.toBeInTheDocument()
        expect(screen.getByTestId('variant-row-9')).toBeInTheDocument()
    })

    it('pages 12 variants as 10 + 2 with global row indices', async () => {
        const user = userEvent.setup()
        render(<Wrapper variants={makeVariants(12)}/>)

        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
        expect(screen.getByTestId('variant-row-0')).toBeInTheDocument()
        expect(screen.queryByTestId('variant-row-10')).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', {name: 'Next page'}))

        expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
        expect(screen.getByTestId('variant-row-10')).toBeInTheDocument()
        expect(screen.getByTestId('variant-row-11')).toBeInTheDocument()
        expect(screen.queryByTestId('variant-row-0')).not.toBeInTheDocument()
    })

    it('Add Variant jumps to the page the new row lands on, open for editing', async () => {
        const user = userEvent.setup()
        render(<Wrapper variants={makeVariants(10)}/>)

        await user.click(screen.getByTestId('add-variant'))

        expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
        // The appended row (global index 10) is visible and editable.
        expect(screen.getByTestId('variant-row-10')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('e.g. PROD-001')).toBeInTheDocument()
    })

    it('a validation error on another page pulls that page into view on submit', async () => {
        const user = userEvent.setup()
        // Row 11 (page 2) has a blank SKU; the user is looking at page 1.
        render(<Wrapper variants={makeVariants(12, {11: {sku: ''}})}/>)

        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
        await user.click(screen.getByRole('button', {name: 'Save'}))

        expect(await screen.findByText('SKU is required')).toBeInTheDocument()
        expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
        expect(screen.getByTestId('variant-row-11')).toBeInTheDocument()
    })
})
