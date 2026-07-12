import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {VariantSelector} from '../VariantSelector'
import {describe, expect, it, vi} from 'vitest'

const variants = [
    {
        id: 'v1',
        retailPrice: 100,
        wholesalePrice: 80,
        retailSalePrice: null,
        wholesaleSalePrice: null,
        stockQuantity: 10,
        attributesJson: '{"Size":"S","Color":"Red"}',
    },
    {
        id: 'v2',
        retailPrice: 120,
        wholesalePrice: 90,
        retailSalePrice: null,
        wholesaleSalePrice: null,
        stockQuantity: 5,
        attributesJson: '{"Size":"M","Color":"Red"}',
    },
    {
        id: 'v3',
        retailPrice: 110,
        wholesalePrice: 85,
        retailSalePrice: null,
        wholesaleSalePrice: null,
        stockQuantity: 0,
        attributesJson: '{"Size":"L","Color":"Blue"}',
    },
    {
        id: 'v4',
        retailPrice: 110,
        wholesalePrice: 85,
        retailSalePrice: null,
        wholesaleSalePrice: null,
        stockQuantity: null,
        attributesJson: '{"Size":"L","Color":"Red"}',
    },
]

describe('VariantSelector', () => {
    /**
     * Validates: Requirements 8.1
     */
    describe('option grouping', () => {
        it('renders attribute keys as group labels with correct option buttons', () => {
            const onSelectionChange = vi.fn()

            render(
                <VariantSelector
                    variants={variants}
                    selectedVariant={null}
                    onSelectionChange={onSelectionChange}
                />,
            )

            // Group labels rendered
            expect(screen.getByText('Size')).toBeInTheDocument()
            expect(screen.getByText('Color')).toBeInTheDocument()

            // Size options
            expect(screen.getByRole('button', {name: 'S'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'M'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'L'})).toBeInTheDocument()

            // Color options
            expect(screen.getByRole('button', {name: 'Red'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Blue'})).toBeInTheDocument()
        })
    })

    /**
     * Validates: Requirements 8.2
     */
    describe('disabled out-of-stock options', () => {
        it('disables options where all variants with that value are out of stock', () => {
            const onSelectionChange = vi.fn()

            render(
                <VariantSelector
                    variants={variants}
                    selectedVariant={null}
                    onSelectionChange={onSelectionChange}
                />,
            )

            // "L" is disabled — v3 has stock=0 and v4 has stock=null
            const sizeL = screen.getByRole('button', {name: 'L'})
            expect(sizeL).toBeDisabled()
            expect(sizeL).toHaveClass('opacity-50', 'cursor-not-allowed', 'line-through')

            // "Blue" is disabled — only v3 has Blue, and it has stock=0
            const colorBlue = screen.getByRole('button', {name: 'Blue'})
            expect(colorBlue).toBeDisabled()
            expect(colorBlue).toHaveClass('opacity-50', 'cursor-not-allowed', 'line-through')

            // "S" and "M" are NOT disabled — they have stock > 0
            expect(screen.getByRole('button', {name: 'S'})).not.toBeDisabled()
            expect(screen.getByRole('button', {name: 'M'})).not.toBeDisabled()

            // "Red" is NOT disabled — v1 (stock=10) and v2 (stock=5) have Red
            expect(screen.getByRole('button', {name: 'Red'})).not.toBeDisabled()
        })
    })

    /**
     * Validates: Requirements 8.3
     */
    describe('multi-attribute selection', () => {
        it('calls onSelectionChange with combined attributes when selecting size and color', async () => {
            const user = userEvent.setup()
            const onSelectionChange = vi.fn()

            render(
                <VariantSelector
                    variants={variants}
                    selectedVariant={null}
                    onSelectionChange={onSelectionChange}
                />,
            )

            // Click "S"
            await user.click(screen.getByRole('button', {name: 'S'}))
            expect(onSelectionChange).toHaveBeenCalledWith({Size: 'S'})

            // Click "Red"
            await user.click(screen.getByRole('button', {name: 'Red'}))
            expect(onSelectionChange).toHaveBeenCalledWith({Size: 'S', Color: 'Red'})
        })

        it('applies selected style to clicked option', async () => {
            const user = userEvent.setup()

            render(
                <VariantSelector
                    variants={variants}
                    selectedVariant={null}
                    onSelectionChange={vi.fn()}
                />,
            )

            const sButton = screen.getByRole('button', {name: 'S'})
            await user.click(sButton)

            expect(sButton).toHaveClass('bg-(--sf-accent)', 'text-(--sf-accent-text)')
        })
    })
})
