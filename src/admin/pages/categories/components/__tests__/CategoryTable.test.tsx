import {beforeEach, describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import type {ComponentProps} from 'react'
import type {CategoryListItem} from '../../types'
import {CategoryTable} from '../CategoryTable'

const mockMutate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/admin/pages/categories/hooks/useDeleteCategory', () => ({
    useDeleteCategory: vi.fn(() => ({mutate: mockMutate, isPending: false})),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

const electronics: CategoryListItem = {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Tech stuff',
    imageUrl: null,
    parent: null,
}
const laptops: CategoryListItem = {
    id: '2',
    name: 'Laptops',
    slug: 'laptops',
    description: null,
    imageUrl: null,
    parent: {id: '1', name: 'Electronics'},
}

function renderCategoryTable(overrides: Partial<ComponentProps<typeof CategoryTable>> = {}) {
    const defaultProps: ComponentProps<typeof CategoryTable> = {
        data: [],
        isLoading: false,
        canMutate: true,
        pageCount: 1,
        pagination: {pageIndex: 0, pageSize: 10},
        onPaginationChange: vi.fn(),
        sorting: [],
        onSortingChange: vi.fn(),
    }
    return render(
        <MemoryRouter>
            <CategoryTable {...defaultProps} {...overrides} />
        </MemoryRouter>,
    )
}

describe('CategoryTable', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('columns', () => {
        it('renders column headers: Name, Main Category, Slug, Actions — Description is folded into Name', () => {
            // laptops (not electronics) so the Main Category CELL shows a
            // parent name rather than the same "Main Category" text as the
            // header — otherwise getByText below would match two elements.
            renderCategoryTable({data: [laptops]})

            expect(screen.getByRole('columnheader', {name: 'Name'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Main Category'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Slug'})).toBeInTheDocument()
            expect(screen.getByRole('columnheader', {name: 'Actions'})).toBeInTheDocument()
            expect(screen.queryByText('Description')).not.toBeInTheDocument()
        })

        it('renders category data, with description under the name or a placeholder when absent', () => {
            renderCategoryTable({data: [electronics, laptops]})

            // "Electronics" appears twice: electronics' own name, and again
            // as laptops' parent in the Main Category column.
            expect(screen.getAllByText('Electronics')).toHaveLength(2)
            expect(screen.getByText('electronics')).toBeInTheDocument()
            expect(screen.getByText('Tech stuff')).toBeInTheDocument()
            expect(screen.getByText('Laptops')).toBeInTheDocument()
            expect(screen.getByText('laptops')).toBeInTheDocument()
            expect(screen.getByText('No description for category')).toBeInTheDocument()
        })

        it('renders the parent name when a category has a parent', () => {
            renderCategoryTable({data: [laptops]})

            // "Electronics" appears both as the parent's name in the Main Category
            // column and would appear again if Laptops itself were named that —
            // here it's unambiguous since only that cell contains it.
            expect(screen.getByText('Electronics')).toBeInTheDocument()
        })

        it('renders "Main Category" when a category has no parent', () => {
            renderCategoryTable({data: [electronics]})

            // Appears twice: once as the column header, once as this row's
            // fallback since Electronics itself has no parent.
            expect(screen.getAllByText('Main Category')).toHaveLength(2)
        })
    })

    describe('row actions — canMutate true', () => {
        it('shows Edit and Delete action buttons', () => {
            renderCategoryTable({data: [electronics], canMutate: true})

            expect(screen.getByLabelText('Edit Electronics')).toBeInTheDocument()
            expect(screen.getByLabelText('Delete Electronics')).toBeInTheDocument()
        })

        it('clicking Delete opens a confirmation dialog naming the category', () => {
            renderCategoryTable({data: [electronics], canMutate: true})

            fireEvent.click(screen.getByLabelText('Delete Electronics'))

            expect(screen.getByText('Delete Category')).toBeInTheDocument()
            expect(screen.getByText(/Are you sure you want to delete "Electronics"/)).toBeInTheDocument()
        })

        it('confirming the dialog calls the delete mutation with the category id', () => {
            renderCategoryTable({data: [electronics], canMutate: true})

            fireEvent.click(screen.getByLabelText('Delete Electronics'))
            fireEvent.click(screen.getByRole('button', {name: 'Delete'}))

            expect(mockMutate).toHaveBeenCalledWith({id: '1'}, expect.anything())
        })

        it('closing the dialog without confirming does not call the mutation', () => {
            renderCategoryTable({data: [electronics], canMutate: true})

            fireEvent.click(screen.getByLabelText('Delete Electronics'))
            fireEvent.click(screen.getByRole('button', {name: 'Cancel'}))

            expect(mockMutate).not.toHaveBeenCalled()
            expect(screen.queryByText('Delete Category')).not.toBeInTheDocument()
        })
    })

    describe('row actions — canMutate false', () => {
        it('hides Edit and Delete action buttons', () => {
            renderCategoryTable({data: [electronics], canMutate: false})

            expect(screen.queryByLabelText('Edit Electronics')).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Delete Electronics')).not.toBeInTheDocument()
        })
    })

    describe('navigation', () => {
        it('clicking Edit navigates to the edit screen', () => {
            renderCategoryTable({data: [electronics]})

            fireEvent.click(screen.getByLabelText('Edit Electronics'))

            expect(mockNavigate).toHaveBeenCalledWith('/admin/products/categories/1/edit')
        })

        it('double-clicking a row navigates to the edit screen', () => {
            renderCategoryTable({data: [electronics]})

            fireEvent.doubleClick(screen.getByText('Electronics'))

            expect(mockNavigate).toHaveBeenCalledWith('/admin/products/categories/1/edit')
        })
    })

    describe('pagination and sorting passthrough', () => {
        it('reflects the controlled sorting prop as the sort-icon state', () => {
            const {container} = renderCategoryTable({
                data: [electronics],
                sorting: [{id: 'name', desc: true}],
            })

            expect(container.querySelector('.lucide-arrow-down')).toBeInTheDocument()
        })

        it('calls onSortingChange when a sortable header is clicked', () => {
            const onSortingChange = vi.fn()
            renderCategoryTable({data: [electronics], onSortingChange})

            fireEvent.click(screen.getByText('Name'))

            expect(onSortingChange).toHaveBeenCalledTimes(1)
        })

        it('does not make the Main Category column sortable', () => {
            const onSortingChange = vi.fn()
            renderCategoryTable({data: [electronics], onSortingChange})

            fireEvent.click(screen.getByRole('columnheader', {name: 'Main Category'}))

            expect(onSortingChange).not.toHaveBeenCalled()
        })
    })
})
