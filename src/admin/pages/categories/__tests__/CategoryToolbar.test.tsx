import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {CategoryToolbar} from '../components/CategoryToolbar.tsx'

describe('CategoryToolbar', () => {
    it('renders the search input with the current value', () => {
        render(
            <CategoryToolbar
                searchValue="electronics"
                onSearchChange={vi.fn()}
                canMutate={true}
                onCreateCategory={vi.fn()}
            />,
        )

        expect(screen.getByPlaceholderText('Search categories by name...')).toHaveValue('electronics')
    })

    it('calls onSearchChange when the search box changes', () => {
        const onSearchChange = vi.fn()
        render(
            <CategoryToolbar
                searchValue=""
                onSearchChange={onSearchChange}
                canMutate={true}
                onCreateCategory={vi.fn()}
            />,
        )

        fireEvent.change(screen.getByPlaceholderText('Search categories by name...'), {
            target: {value: 'laptops'},
        })

        expect(onSearchChange).toHaveBeenCalledWith('laptops')
    })

    it('shows the New Category button and calls onCreateCategory when canMutate is true', () => {
        const onCreateCategory = vi.fn()
        render(
            <CategoryToolbar
                searchValue=""
                onSearchChange={vi.fn()}
                canMutate={true}
                onCreateCategory={onCreateCategory}
            />,
        )

        fireEvent.click(screen.getByText('+ New Category'))

        expect(onCreateCategory).toHaveBeenCalledTimes(1)
    })

    it('hides the New Category button when canMutate is false', () => {
        render(
            <CategoryToolbar
                searchValue=""
                onSearchChange={vi.fn()}
                canMutate={false}
                onCreateCategory={vi.fn()}
            />,
        )

        expect(screen.queryByText('+ New Category')).not.toBeInTheDocument()
    })
})
