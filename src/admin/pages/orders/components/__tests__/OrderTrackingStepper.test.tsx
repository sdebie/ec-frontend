import {describe, it, expect} from 'vitest'
import {render, screen} from '@testing-library/react'
import {OrderTrackingStepper} from '../OrderTrackingStepper'
import type {TrackingStep} from '../../utils/orderTrackingSteps'
import {formatDisplayDateTime} from '@/shared/utils/formatDateTime'

/**
 * Covers the render wiring only — which state maps to which subtext/label text
 * in the DOM. The state-machine derivation itself (which step is 'current' for a
 * given order) is pinned exhaustively in utils/__tests__/orderTrackingSteps.test.ts.
 */
describe('OrderTrackingStepper', () => {
    it('renders every step label and the state-driven subtext', () => {
        const steps: TrackingStep[] = [
            {id: 'placed', label: 'Placed', state: 'complete', timestamp: '2026-04-28T10:14:00Z'},
            {id: 'paid', label: 'Paid', state: 'complete', timestamp: '2026-04-28T10:14:00Z'},
            {id: 'preparing', label: 'Preparing', state: 'current'},
            {id: 'shipped', label: 'Shipped', state: 'pending'},
            {id: 'delivered', label: 'Delivered', state: 'pending'},
        ]

        render(<OrderTrackingStepper steps={steps}/>)

        expect(screen.getByText('Placed')).toBeInTheDocument()
        expect(screen.getByText('Paid')).toBeInTheDocument()
        expect(screen.getByText('Preparing')).toBeInTheDocument()
        expect(screen.getByText('Shipped')).toBeInTheDocument()
        expect(screen.getByText('Delivered')).toBeInTheDocument()

        expect(screen.getByText('In progress')).toBeInTheDocument()
        expect(screen.getAllByText('Pending')).toHaveLength(2)
        expect(screen.getAllByText(formatDisplayDateTime('2026-04-28T10:14:00Z'))).toHaveLength(2)
    })

    it('marks the current step for assistive tech via aria-current', () => {
        const steps: TrackingStep[] = [
            {id: 'placed', label: 'Placed', state: 'complete', timestamp: '2026-04-28T10:14:00Z'},
            {id: 'paid', label: 'Paid', state: 'current'},
            {id: 'preparing', label: 'Preparing', state: 'pending'},
            {id: 'shipped', label: 'Shipped', state: 'pending'},
            {id: 'delivered', label: 'Delivered', state: 'pending'},
        ]

        render(<OrderTrackingStepper steps={steps}/>)

        const current = screen.getByText('Paid').closest('li')
        expect(current).toHaveAttribute('aria-current', 'step')

        const complete = screen.getByText('Placed').closest('li')
        expect(complete).not.toHaveAttribute('aria-current')
    })

    it('a stopped step shows its frozen date, not "In progress" or "Pending"', () => {
        const steps: TrackingStep[] = [
            {id: 'placed', label: 'Placed', state: 'complete', timestamp: '2026-04-28T10:14:00Z'},
            {id: 'paid', label: 'Paid', state: 'complete', timestamp: '2026-04-28T10:14:00Z'},
            {id: 'preparing', label: 'Preparing', state: 'stopped', timestamp: '2026-04-28T11:00:00Z'},
            {id: 'shipped', label: 'Shipped', state: 'pending'},
            {id: 'delivered', label: 'Delivered', state: 'pending'},
        ]

        render(<OrderTrackingStepper steps={steps}/>)

        expect(screen.queryByText('In progress')).not.toBeInTheDocument()
        expect(screen.getByText(formatDisplayDateTime('2026-04-28T11:00:00Z'))).toBeInTheDocument()
    })
})
