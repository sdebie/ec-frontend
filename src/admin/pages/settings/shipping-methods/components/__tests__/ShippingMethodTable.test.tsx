import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import type {ComponentProps} from 'react'
import type {ShippingMethod} from '../../types'
import {ShippingMethodTable} from '../ShippingMethodTable'

vi.mock('@/shared/utils/formatAmount', () => ({
    formatAmount: vi.fn((val: number | null) => (val == null ? '—' : `R ${(val / 100).toFixed(2)}`)),
}))

const standardDelivery: ShippingMethod = {
    id: '1',
    name: 'Standard Delivery',
    baseFee: 5000,
    active: true,
    estimatedDays: '3-5 business days',
    requiresAddress: true,
}
const expressDelivery: ShippingMethod = {
    id: '2',
    name: 'Express Delivery',
    baseFee: 15000,
    active: false,
    estimatedDays: '1-2 business days',
    requiresAddress: false,
}

function renderTable(overrides: Partial<ComponentProps<typeof ShippingMethodTable>> = {}) {
    const defaultProps: ComponentProps<typeof ShippingMethodTable> = {
        data: [],
        isLoading: false,
        canMutate: true,
        onEdit: vi.fn(),
    }
    return render(<ShippingMethodTable {...defaultProps} {...overrides} />)
}

describe('ShippingMethodTable', () => {
    describe('columns', () => {
        it('renders column headers: Name, Base Fee, Estimated Days, Active, Actions', () => {
            renderTable({data: [standardDelivery]})

            expect(screen.getByRole('columnheader', {name: 'Name'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Base Fee'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Estimated Days'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Active'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Actions'})).toBeInTheDocument()
        })

        it('renders shipping method data', () => {
            renderTable({data: [standardDelivery, expressDelivery]})

            expect(screen.getByText('Standard Delivery')).toBeInTheDocument()
            expect(screen.getByText('3-5 business days')).toBeInTheDocument()
            expect(screen.getByText('Express Delivery')).toBeInTheDocument()
            // 'Active' also names the column header, so the status badge is disambiguated by count.
            expect(screen.getAllByText('Active')).toHaveLength(2)
            expect(screen.getByText('Inactive')).toBeInTheDocument()
        })
    })

    describe('row actions — canMutate true', () => {
        it('shows an Edit action for each row', () => {
            renderTable({data: [standardDelivery]})
            expect(screen.getByLabelText('Edit Standard Delivery')).toBeInTheDocument()
        })

        it('clicking Edit calls onEdit with the row data', () => {
            const onEdit = vi.fn()
            renderTable({data: [standardDelivery], onEdit})

            fireEvent.click(screen.getByLabelText('Edit Standard Delivery'))

            expect(onEdit).toHaveBeenCalledWith(standardDelivery)
        })

        it('double-clicking a row calls onEdit with the row data', () => {
            const onEdit = vi.fn()
            renderTable({data: [standardDelivery], onEdit})

            fireEvent.doubleClick(screen.getByText('Standard Delivery'))

            expect(onEdit).toHaveBeenCalledWith(standardDelivery)
        })
    })

    describe('row actions — canMutate false', () => {
        it('hides the Actions column and all row actions', () => {
            renderTable({data: [standardDelivery], canMutate: false})

            expect(screen.queryByRole('columnheader', {name: 'Actions'})).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Edit Standard Delivery')).not.toBeInTheDocument()
        })

        it('does not call onEdit when a row is double-clicked', () => {
            const onEdit = vi.fn()
            renderTable({data: [standardDelivery], canMutate: false, onEdit})

            fireEvent.doubleClick(screen.getByText('Standard Delivery'))

            expect(onEdit).not.toHaveBeenCalled()
        })
    })
})
