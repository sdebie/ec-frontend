import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {CatalogPagination} from '../CatalogPagination'

describe('CatalogPagination', () => {
    const defaultProps = {
        page: 2,
        totalPages: 5,
        totalElements: 100,
        pageSize: 20,
        onPageChange: vi.fn(),
    }

    it('renders "Page X of Y" text', () => {
        render(<CatalogPagination {...defaultProps} />)

        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
    })

    it('renders "Showing X–Y of Z products" summary', () => {
        render(<CatalogPagination {...defaultProps} />)

        expect(screen.getByText('Showing 21–40 of 100 products')).toBeInTheDocument()
    })

    it('disables Previous button on first page', () => {
        render(<CatalogPagination {...defaultProps} page={1}/>)

        expect(screen.getByRole('button', {name: 'Previous'})).toBeDisabled()
    })

    it('disables Next button on last page', () => {
        render(<CatalogPagination {...defaultProps} page={5}/>)

        expect(screen.getByRole('button', {name: 'Next'})).toBeDisabled()
    })

    it('calls onPageChange with page - 1 when Previous is clicked', async () => {
        const user = userEvent.setup()
        const onPageChange = vi.fn()
        render(<CatalogPagination {...defaultProps} onPageChange={onPageChange}/>)

        await user.click(screen.getByRole('button', {name: 'Previous'}))

        expect(onPageChange).toHaveBeenCalledWith(1)
    })

    it('calls onPageChange with page + 1 when Next is clicked', async () => {
        const user = userEvent.setup()
        const onPageChange = vi.fn()
        render(<CatalogPagination {...defaultProps} onPageChange={onPageChange}/>)

        await user.click(screen.getByRole('button', {name: 'Next'}))

        expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('hides navigation buttons when totalPages <= 1', () => {
        render(
            <CatalogPagination
                {...defaultProps}
                page={1}
                totalPages={1}
                totalElements={5}
            />
        )

        expect(screen.queryByRole('button', {name: 'Previous'})).not.toBeInTheDocument()
        expect(screen.queryByRole('button', {name: 'Next'})).not.toBeInTheDocument()
    })

    it('still shows summary when totalPages <= 1', () => {
        render(
            <CatalogPagination
                {...defaultProps}
                page={1}
                totalPages={1}
                totalElements={5}
            />
        )

        expect(screen.getByText('Showing 1–5 of 5 products')).toBeInTheDocument()
    })

    it('caps end value at totalElements on last page', () => {
        render(
            <CatalogPagination
                {...defaultProps}
                page={3}
                totalPages={3}
                totalElements={50}
            />
        )

        expect(screen.getByText('Showing 41–50 of 50 products')).toBeInTheDocument()
    })
})
