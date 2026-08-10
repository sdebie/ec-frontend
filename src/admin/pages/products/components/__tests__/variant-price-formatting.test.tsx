import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it} from 'vitest'
import {useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {VariantFields} from '../VariantFields'
import {productSchema, type ProductFormValues} from '../ProductForm'

function Wrapper({variants}: {variants: ProductFormValues['variants']}) {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: 'Formatted product',
            slug: 'formatted-product',
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
    return <VariantFields control={form.control} fields={fields} append={append} remove={remove}/>
}

describe('VariantFields — price formatting', () => {
    it('renders retail and wholesale price as formatted currency when read-only', () => {
        render(
            <Wrapper
                variants={[{id: 'var-1', sku: 'SKU-001', price: '99.99', wholesalePrice: '79.5', stock: 5, attributes: []}]}
            />,
        )

        // formatAmount uses en-ZA/ZAR — assert on the digits+decimals, not the
        // currency glyph, so the test isn't coupled to locale rendering quirks.
        expect(screen.getByText(/99[.,]99/)).toBeInTheDocument()
        expect(screen.getByText(/79[.,]50/)).toBeInTheDocument()
    })

    it('shows an em dash for a variant with no wholesale price, not "R 0.00"', () => {
        render(
            <Wrapper
                variants={[{id: 'var-1', sku: 'SKU-001', price: '10.00', wholesalePrice: '', stock: 1, attributes: []}]}
            />,
        )

        // The wholesale display specifically must read as absent — an em dash —
        // and never a formatted zero, which would misreport "free".
        const wholesaleDisplay = screen.getByTestId('variant-0-wholesale-display')
        expect(wholesaleDisplay).toHaveTextContent('—')
        expect(wholesaleDisplay.textContent).not.toMatch(/0[.,]00/)
    })

    it('edit mode keeps the raw numeric string, not the formatted display', async () => {
        const user = userEvent.setup()
        render(
            <Wrapper
                variants={[{id: 'var-1', sku: 'SKU-001', price: '99.99', wholesalePrice: '79.50', stock: 5, attributes: []}]}
            />,
        )

        await user.click(screen.getByTestId('edit-variant-0'))

        // The input is editable with the exact stored value — formatting a
        // currency string back into a plain decimal input would corrupt typing.
        expect(screen.getByLabelText('Retail Price')).toHaveValue('99.99')
        expect(screen.getByLabelText('Wholesale Price')).toHaveValue('79.50')
    })

    it('a freshly-added row (blank price) shows the input, never a formatted "R NaN"', () => {
        render(<Wrapper variants={[{sku: '', price: '', wholesalePrice: '', stock: 0, attributes: []}]}/>)

        // A brand-new row has a blank SKU, so it mounts in edit mode — the
        // read-only NaN-formatting branch is never reached for it.
        expect(screen.getByLabelText('Retail Price')).toBeInTheDocument()
        expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
    })

    it('shows a dash, never the literal string "NaN", when stock is cleared then collapsed', async () => {
        const user = userEvent.setup()
        render(
            <Wrapper
                variants={[{id: 'var-1', sku: 'SKU-001', price: '10.00', wholesalePrice: '', stock: 5, attributes: []}]}
            />,
        )

        await user.click(screen.getByTestId('edit-variant-0'))
        const stockInput = screen.getByLabelText('Stock')
        await user.clear(stockInput)
        // Clearing a number input drives the field to NaN via valueAsNumber —
        // collapsing back to read-only must not render that raw NaN.
        await user.click(screen.getByTestId('edit-variant-0'))

        expect(screen.getByText(/—\s*in stock/)).toBeInTheDocument()
        expect(screen.queryByText(/NaN/)).not.toBeInTheDocument()
    })
})
