import { describe, it, expect } from 'vitest'
import { render, cleanup, fireEvent, screen } from '@testing-library/react'
import * as fc from 'fast-check'
import { useForm, useFieldArray } from 'react-hook-form'
import { VariantFields } from '../VariantFields'
import type { ProductFormValues } from '../ProductForm'

/**
 * Property 3: Variant remove is blocked when only one row remains
 *
 * For any VariantFields instance with exactly one variant row,
 * the remove button SHALL have disabled={true} and SHALL NOT
 * call remove() when clicked.
 *
 * **Validates: Requirements 2.7**
 */

// Arbitrary for a single variant row with random values
const variantArb = fc.record({
  sku: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
  price: fc
    .tuple(fc.integer({ min: 0, max: 99999 }), fc.integer({ min: 0, max: 99 }))
    .map(([whole, decimal]) => `${whole}.${String(decimal).padStart(2, '0')}`),
  stock: fc.integer({ min: 0, max: 10000 }),
})

// Wrapper component that sets up react-hook-form with exactly one variant
function SingleVariantWrapper({
  initialVariant,
}: {
  initialVariant: { sku: string; price: string; stock: number }
}) {
  const { control } = useForm<ProductFormValues>({
    defaultValues: {
      status: 'DRAFT',
      name: '',
      categoryId: '',
      images: [],
      slug: '',
      imageIds: {},
      variants: [initialVariant],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  })

  return <VariantFields control={control} fields={fields} append={append} remove={remove} />
}

describe('VariantFields — Property: Variant remove is blocked when only one row remains', () => {
  it('remove button is disabled when exactly one variant row exists', () => {
    fc.assert(
      fc.property(variantArb, (variant) => {
        cleanup()
        render(<SingleVariantWrapper initialVariant={variant} />)

        const removeButton = screen.getByTestId('remove-variant-0')
        expect(removeButton).toBeDisabled()
      }),
      { numRuns: 100 },
    )
  })

  it('clicking the disabled remove button does not remove the variant row', () => {
    fc.assert(
      fc.property(variantArb, (variant) => {
        cleanup()
        render(<SingleVariantWrapper initialVariant={variant} />)

        const removeButton = screen.getByTestId('remove-variant-0')
        fireEvent.click(removeButton)

        // The variant row should still exist after clicking the disabled button
        const variantRow = screen.getByTestId('variant-row-0')
        expect(variantRow).toBeInTheDocument()
      }),
      { numRuns: 100 },
    )
  })
})
