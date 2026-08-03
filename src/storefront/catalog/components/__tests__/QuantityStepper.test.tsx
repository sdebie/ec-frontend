import {fireEvent, render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import {QuantityStepper} from '../QuantityStepper'

describe('QuantityStepper', () => {
    it('renders the quantity and raises increment/decrement intents', () => {
        const onIncrement = vi.fn()
        const onDecrement = vi.fn()

        render(<QuantityStepper quantity={2} onIncrement={onIncrement} onDecrement={onDecrement}/>)

        expect(screen.getByText('2')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', {name: /increase quantity/i}))
        fireEvent.click(screen.getByRole('button', {name: /decrease quantity/i}))

        expect(onIncrement).toHaveBeenCalledTimes(1)
        expect(onDecrement).toHaveBeenCalledTimes(1)
    })

    it('disables decrement at one', () => {
        render(<QuantityStepper quantity={1} onIncrement={vi.fn()} onDecrement={vi.fn()}/>)

        expect(screen.getByRole('button', {name: /decrease quantity/i})).toBeDisabled()
    })

    it('leaves increment enabled when no max is given — the catalogue default', () => {
        render(<QuantityStepper quantity={999} onIncrement={vi.fn()} onDecrement={vi.fn()}/>)

        expect(screen.getByRole('button', {name: /increase quantity/i})).toBeEnabled()
    })

    it('disables increment once the max is reached', () => {
        render(<QuantityStepper quantity={3} max={3} onIncrement={vi.fn()} onDecrement={vi.fn()}/>)

        expect(screen.getByRole('button', {name: /increase quantity/i})).toBeDisabled()
    })

    it('keeps increment enabled below the max', () => {
        render(<QuantityStepper quantity={2} max={3} onIncrement={vi.fn()} onDecrement={vi.fn()}/>)

        expect(screen.getByRole('button', {name: /increase quantity/i})).toBeEnabled()
    })
})
