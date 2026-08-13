import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ComponentProps } from 'react'
import type { BrandListItem } from '@/admin/hooks/brands'
import { BrandTable } from '../BrandTable'

const mockMutate = vi.fn()

vi.mock('@/admin/hooks/brands', () => ({
  useDeleteBrand: vi.fn(() => ({ mutate: mockMutate, isPending: false })),
}))

const nike: BrandListItem = { id: '1', name: 'Nike', slug: 'nike', description: 'Sports brand', logoUrl: null }
const adidas: BrandListItem = { id: '2', name: 'Adidas', slug: 'adidas', description: null, logoUrl: null }

function renderBrandTable(overrides: Partial<ComponentProps<typeof BrandTable>> = {}) {
  const defaultProps: ComponentProps<typeof BrandTable> = {
    data: [],
    isLoading: false,
    canMutate: true,
    pageCount: 1,
    pagination: { pageIndex: 0, pageSize: 10 },
    onPaginationChange: vi.fn(),
    sorting: [],
    onSortingChange: vi.fn(),
  }
  return render(
    <MemoryRouter>
      <BrandTable {...defaultProps} {...overrides} />
    </MemoryRouter>,
  )
}

describe('BrandTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('columns', () => {
    it('renders column headers: Name, Slug, Actions — Description is folded into Name', () => {
      renderBrandTable({ data: [nike] })

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Slug')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
      expect(screen.queryByText('Description')).not.toBeInTheDocument()
    })

    it('renders brand data, with description under the name or a placeholder when absent', () => {
      renderBrandTable({ data: [nike, adidas] })

      expect(screen.getByText('Nike')).toBeInTheDocument()
      expect(screen.getByText('nike')).toBeInTheDocument()
      expect(screen.getByText('Sports brand')).toBeInTheDocument()
      expect(screen.getByText('Adidas')).toBeInTheDocument()
      expect(screen.getByText('adidas')).toBeInTheDocument()
      expect(screen.getByText('No description for brand')).toBeInTheDocument()
    })
  })

  describe('row actions — canMutate true', () => {
    it('shows Edit and Delete action buttons', () => {
      renderBrandTable({ data: [nike], canMutate: true })

      expect(screen.getByLabelText('Edit Nike')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete Nike')).toBeInTheDocument()
    })

    it('clicking Delete opens a confirmation dialog naming the brand', () => {
      renderBrandTable({ data: [nike], canMutate: true })

      fireEvent.click(screen.getByLabelText('Delete Nike'))

      expect(screen.getByText('Delete Brand')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete "Nike"/)).toBeInTheDocument()
    })

    it('confirming the dialog calls the delete mutation with the brand id', () => {
      renderBrandTable({ data: [nike], canMutate: true })

      fireEvent.click(screen.getByLabelText('Delete Nike'))
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(mockMutate).toHaveBeenCalledWith({ id: '1' }, expect.anything())
    })

    it('closing the dialog without confirming does not call the mutation', () => {
      renderBrandTable({ data: [nike], canMutate: true })

      fireEvent.click(screen.getByLabelText('Delete Nike'))
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(mockMutate).not.toHaveBeenCalled()
      expect(screen.queryByText('Delete Brand')).not.toBeInTheDocument()
    })
  })

  describe('row actions — canMutate false', () => {
    it('hides Edit and Delete action buttons', () => {
      renderBrandTable({ data: [nike], canMutate: false })

      expect(screen.queryByLabelText('Edit Nike')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Delete Nike')).not.toBeInTheDocument()
    })
  })

  describe('pagination and sorting passthrough', () => {
    it('reflects the controlled sorting prop as the sort-icon state', () => {
      const { container } = renderBrandTable({
        data: [nike],
        sorting: [{ id: 'name', desc: true }],
      })

      expect(container.querySelector('.lucide-arrow-down')).toBeInTheDocument()
    })

    it('calls onSortingChange when a sortable header is clicked', () => {
      const onSortingChange = vi.fn()
      renderBrandTable({ data: [nike], onSortingChange })

      fireEvent.click(screen.getByText('Name'))

      expect(onSortingChange).toHaveBeenCalledTimes(1)
    })
  })
})
