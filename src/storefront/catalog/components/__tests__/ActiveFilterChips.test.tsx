import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {ActiveFilterChips} from '../ActiveFilterChips.tsx'

describe('ActiveFilterChips', () => {
    const defaultProps = {
        search: '',
        categoryName: null,
        brandName: null,
        onClearSearch: vi.fn(),
        onClearCategory: vi.fn(),
        onClearBrand: vi.fn(),
    }

    it('renders nothing when no filters are active', () => {
        const {container} = render(<ActiveFilterChips {...defaultProps} />)

        expect(container.firstChild).toBeNull()
    })

    it('renders a search chip when search is active', () => {
        render(<ActiveFilterChips {...defaultProps} search="shoes"/>)

        expect(screen.getByText('Search: shoes')).toBeInTheDocument()
    })

    it('renders a category chip when categoryName is set', () => {
        render(<ActiveFilterChips {...defaultProps} categoryName="Electronics"/>)

        expect(screen.getByText('Category: Electronics')).toBeInTheDocument()
    })

    it('renders a brand chip when brandName is set', () => {
        render(<ActiveFilterChips {...defaultProps} brandName="Nike"/>)

        expect(screen.getByText('Brand: Nike')).toBeInTheDocument()
    })

    it('renders multiple chips when multiple filters are active', () => {
        render(
            <ActiveFilterChips
                {...defaultProps}
                search="running"
                categoryName="Footwear"
                brandName="Adidas"
            />
        )

        expect(screen.getByText('Search: running')).toBeInTheDocument()
        expect(screen.getByText('Category: Footwear')).toBeInTheDocument()
        expect(screen.getByText('Brand: Adidas')).toBeInTheDocument()
    })

    it('calls onClearSearch when search chip × is clicked', async () => {
        const user = userEvent.setup()
        const onClearSearch = vi.fn()
        render(
            <ActiveFilterChips
                {...defaultProps}
                search="shoes"
                onClearSearch={onClearSearch}
            />
        )

        await user.click(screen.getByRole('button', {name: 'Remove Search: shoes filter'}))

        expect(onClearSearch).toHaveBeenCalledOnce()
    })

    it('calls onClearCategory when category chip × is clicked', async () => {
        const user = userEvent.setup()
        const onClearCategory = vi.fn()
        render(
            <ActiveFilterChips
                {...defaultProps}
                categoryName="Electronics"
                onClearCategory={onClearCategory}
            />
        )

        await user.click(
            screen.getByRole('button', {name: 'Remove Category: Electronics filter'})
        )

        expect(onClearCategory).toHaveBeenCalledOnce()
    })

    it('calls onClearBrand when brand chip × is clicked', async () => {
        const user = userEvent.setup()
        const onClearBrand = vi.fn()
        render(
            <ActiveFilterChips
                {...defaultProps}
                brandName="Nike"
                onClearBrand={onClearBrand}
            />
        )

        await user.click(screen.getByRole('button', {name: 'Remove Brand: Nike filter'}))

        expect(onClearBrand).toHaveBeenCalledOnce()
    })
})
