import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {VariantFields} from '../VariantFields'
import {productSchema, type ProductFormValues} from '../ProductForm'

type Variant = ProductFormValues['variants'][number]

function Wrapper({variants}: {variants: ProductFormValues['variants']}) {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: 'Attribute product',
            slug: 'attribute-product',
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

function baseVariant(overrides: Partial<Variant> = {}): Variant {
    return {id: 'var-1', sku: 'SKU-001', price: '10.00', wholesalePrice: '', stock: 5, attributes: [], ...overrides}
}

describe('VariantFields — attribute editor', () => {
    it('quick-adds Colour and Size, hiding each chip once its key is present', async () => {
        const user = userEvent.setup()
        render(<Wrapper variants={[baseVariant()]}/>)

        await user.click(screen.getByTestId('edit-variant-0'))
        expect(screen.getByTestId('add-attribute-colour-0')).toBeInTheDocument()
        expect(screen.getByTestId('add-attribute-size-0')).toBeInTheDocument()

        await user.click(screen.getByTestId('add-attribute-colour-0'))
        expect(screen.queryByTestId('add-attribute-colour-0')).not.toBeInTheDocument()
        expect(screen.getByTestId('add-attribute-size-0')).toBeInTheDocument()
        expect(screen.getByLabelText('Attribute name (row 1)')).toHaveValue('Colour')

        await user.click(screen.getByTestId('add-attribute-size-0'))
        expect(screen.queryByTestId('add-attribute-size-0')).not.toBeInTheDocument()
    })

    it('adds a custom attribute row and lets both name and value be typed', async () => {
        const user = userEvent.setup()
        render(<Wrapper variants={[baseVariant()]}/>)

        await user.click(screen.getByTestId('edit-variant-0'))
        await user.click(screen.getByTestId('add-attribute-custom-0'))

        await user.type(screen.getByLabelText('Attribute name (row 1)'), 'Material')
        await user.type(screen.getByLabelText('Attribute value (row 1)'), 'Cotton')

        expect(screen.getByLabelText('Attribute name (row 1)')).toHaveValue('Material')
        expect(screen.getByLabelText('Attribute value (row 1)')).toHaveValue('Cotton')
    })

    it('removes an attribute row, and its quick-add chip reappears', async () => {
        const user = userEvent.setup()
        render(<Wrapper variants={[baseVariant({attributes: [{key: 'Colour', value: 'Navy'}]})]}/>)

        await user.click(screen.getByTestId('edit-variant-0'))
        expect(screen.getByTestId('variant-0-attribute-0')).toBeInTheDocument()
        expect(screen.queryByTestId('add-attribute-colour-0')).not.toBeInTheDocument()

        await user.click(screen.getByTestId('remove-attribute-0-0'))
        expect(screen.queryByTestId('variant-0-attribute-0')).not.toBeInTheDocument()
        expect(screen.getByTestId('add-attribute-colour-0')).toBeInTheDocument()
    })

    it('shows a collapsed summary combining every attribute name and value', () => {
        render(
            <Wrapper
                variants={[baseVariant({attributes: [{key: 'Colour', value: 'Navy'}, {key: 'Size', value: 'L'}]})]}
            />,
        )

        // Starts collapsed — non-blank SKU.
        expect(screen.getByText('Colour: Navy · Size: L')).toBeInTheDocument()
    })

    it('blocks submission on a duplicate attribute name within one variant (case-insensitive)', async () => {
        const user = userEvent.setup()
        render(
            <Wrapper
                variants={[baseVariant({attributes: [{key: 'Colour', value: 'Navy'}, {key: 'colour', value: 'Red'}]})]}
            />,
        )

        await user.click(screen.getByRole('button', {name: 'Save'}))

        expect(await screen.findByText('Attribute name is already used on this variant')).toBeInTheDocument()
    })

    it('blocks submission when combined attributes exceed the 254-character backend column', async () => {
        const user = userEvent.setup()
        // Each key/value individually stays within its own per-field cap
        // (40/60) — only the JSON-serialised TOTAL exceeds 254.
        const longAttributes = Array.from({length: 4}, (_, i) => ({
            key: `Attribute${i}${'A'.repeat(30)}`,
            value: 'B'.repeat(55),
        }))
        render(<Wrapper variants={[baseVariant({attributes: longAttributes})]}/>)

        await user.click(screen.getByRole('button', {name: 'Save'}))

        expect(await screen.findByText(/Attributes are too long once combined/)).toBeInTheDocument()
    })
})
