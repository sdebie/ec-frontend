import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {beforeEach, describe, expect, it} from 'vitest'
import {CartIcon} from '../CartIcon'
import {useCartStore} from '../cartStore'

function renderCartIcon(className?: string) {
    return render(
        <MemoryRouter>
            <CartIcon className={className}/>
        </MemoryRouter>
    )
}

describe('CartIcon', () => {
    beforeEach(() => {
        useCartStore.setState({items: [], itemCount: 0})
    })

    it('renders a link to /cart', () => {
        renderCartIcon()
        const link = screen.getByRole('link', {name: /cart/i})
        expect(link).toHaveAttribute('href', '/cart')
    })

    it('does not render a badge when cart is empty', () => {
        renderCartIcon()
        expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('renders a badge with item count when cart has items', () => {
        useCartStore.setState({
            items: [
                {variantId: 'v1', productName: 'Shirt', variantLabel: 'Red / M', quantity: 2},
                {variantId: 'v2', productName: 'Pants', variantLabel: 'Blue / L', quantity: 3},
            ],
            itemCount: 5,
        })

        renderCartIcon()
        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('does not render badge when itemCount is 0', () => {
        useCartStore.setState({items: [], itemCount: 0})

        renderCartIcon()
        // No numeric badge should be present
        const link = screen.getByRole('link', {name: /cart/i})
        const badge = link.querySelector('span')
        expect(badge).toBeNull()
    })

    it('applies className prop for positioning flexibility', () => {
        renderCartIcon('ml-4')
        const link = screen.getByRole('link', {name: /cart/i})
        expect(link.className).toContain('ml-4')
    })

    it('updates badge reactively when itemCount changes', () => {
        useCartStore.setState({
            items: [{variantId: 'v1', productName: 'A', variantLabel: 'B', quantity: 1}],
            itemCount: 1
        })
        const {rerender} = render(
            <MemoryRouter>
                <CartIcon/>
            </MemoryRouter>
        )

        expect(screen.getByText('1')).toBeInTheDocument()

        // Simulate adding more items
        useCartStore.setState({
            items: [
                {variantId: 'v1', productName: 'A', variantLabel: 'B', quantity: 1},
                {variantId: 'v2', productName: 'C', variantLabel: 'D', quantity: 4},
            ],
            itemCount: 5,
        })

        rerender(
            <MemoryRouter>
                <CartIcon/>
            </MemoryRouter>
        )

        expect(screen.getByText('5')).toBeInTheDocument()
    })
})
