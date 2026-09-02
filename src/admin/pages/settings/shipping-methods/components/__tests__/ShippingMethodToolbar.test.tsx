import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {ShippingMethodToolbar} from '../ShippingMethodToolbar'

describe('ShippingMethodToolbar', () => {
    it('renders the search input with the current value', () => {
        render(
            <ShippingMethodToolbar
                searchValue="express"
                onSearchChange={vi.fn()}
                canMutate={true}
                onAddShippingMethod={vi.fn()}
            />,
        )

        expect(screen.getByPlaceholderText('Search shipping methods...')).toHaveValue('express')
    })

    it('calls onSearchChange when the search box changes', () => {
        const onSearchChange = vi.fn()
        render(
            <ShippingMethodToolbar
                searchValue=""
                onSearchChange={onSearchChange}
                canMutate={true}
                onAddShippingMethod={vi.fn()}
            />,
        )

        fireEvent.change(screen.getByPlaceholderText('Search shipping methods...'), {
            target: {value: 'express'},
        })

        expect(onSearchChange).toHaveBeenCalledWith('express')
    })

    it('shows the Add shipping method button and calls onAddShippingMethod when canMutate is true', () => {
        const onAddShippingMethod = vi.fn()
        render(
            <ShippingMethodToolbar
                searchValue=""
                onSearchChange={vi.fn()}
                canMutate={true}
                onAddShippingMethod={onAddShippingMethod}
            />,
        )

        fireEvent.click(screen.getByText('Add shipping method'))

        expect(onAddShippingMethod).toHaveBeenCalledTimes(1)
    })

    it('hides the Add shipping method button when canMutate is false', () => {
        render(
            <ShippingMethodToolbar
                searchValue=""
                onSearchChange={vi.fn()}
                canMutate={false}
                onAddShippingMethod={vi.fn()}
            />,
        )

        expect(screen.queryByText('Add shipping method')).not.toBeInTheDocument()
    })
})
