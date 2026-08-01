import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CatalogToolbar } from '../CatalogToolbar'

function renderToolbar(props: Partial<React.ComponentProps<typeof CatalogToolbar>> = {}) {
  const defaultProps: React.ComponentProps<typeof CatalogToolbar> = {
    activeFilterCount: 0,
    sort: 'name',
    onSortChange: vi.fn(),
    onFilterToggle: vi.fn(),
    ...props,
  }
  return render(
    <MemoryRouter>
      <CatalogToolbar {...defaultProps} />
    </MemoryRouter>,
  )
}

describe('CatalogToolbar', () => {
  describe('badge count arithmetic', () => {
    it('shows no badge when activeFilterCount is 0', () => {
      renderToolbar({ activeFilterCount: 0 })

      // The filter button should not have a count badge
      const filterButton = screen.getByRole('button', { name: 'Filters' })
      expect(filterButton).toBeInTheDocument()
      // No badge element — badge text would be a number
      expect(filterButton.querySelector('span.inline-flex')).toBeNull()
    })

    it('shows badge with count 1 when one filter is active', () => {
      renderToolbar({ activeFilterCount: 1 })

      const filterButton = screen.getByRole('button', { name: 'Filters (1 active)' })
      expect(filterButton).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('shows badge with count 3 when three filters are active', () => {
      renderToolbar({ activeFilterCount: 3 })

      const filterButton = screen.getByRole('button', { name: 'Filters (3 active)' })
      expect(filterButton).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows badge with count 4 (max — search + category + brand + availability)', () => {
      renderToolbar({ activeFilterCount: 4 })

      const filterButton = screen.getByRole('button', { name: 'Filters (4 active)' })
      expect(filterButton).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })

  describe('sort select', () => {
    it('renders with "Name A–Z" selected by default', () => {
      renderToolbar({ sort: 'name' })

      const sortSelect = screen.getByRole('combobox', { name: /sort by/i })
      expect(sortSelect).toHaveValue('name')
    })

    it('calls onSortChange with the new sort value when changed', async () => {
      const user = userEvent.setup()
      const onSortChange = vi.fn()
      renderToolbar({ sort: 'name', onSortChange })

      const sortSelect = screen.getByRole('combobox', { name: /sort by/i })
      await user.selectOptions(sortSelect, 'price-asc')

      expect(onSortChange).toHaveBeenCalledWith('price-asc')
    })

    it('offers exactly three options: Name A–Z, Price: low–high, Price: high–low', () => {
      renderToolbar()

      const sortSelect = screen.getByRole('combobox', { name: /sort by/i })
      const options = sortSelect.querySelectorAll('option')
      expect(options).toHaveLength(3)
      expect(options[0]).toHaveTextContent('Name A–Z')
      expect(options[1]).toHaveTextContent('Price: low–high')
      expect(options[2]).toHaveTextContent('Price: high–low')
    })
  })

  describe('sort change resets page (integration via ProductListPage)', () => {
    // This test is at a higher level — we verify that the onSortChange callback is invoked.
    // The actual URL + page reset is tested in the ProductListPage integration tests.
    it('onSortChange is invoked for price-desc', async () => {
      const user = userEvent.setup()
      const onSortChange = vi.fn()
      renderToolbar({ sort: 'name', onSortChange })

      const sortSelect = screen.getByRole('combobox', { name: /sort by/i })
      await user.selectOptions(sortSelect, 'price-desc')

      expect(onSortChange).toHaveBeenCalledWith('price-desc')
    })
  })

  describe('filter toggle', () => {
    it('calls onFilterToggle when the filter button is clicked', async () => {
      const user = userEvent.setup()
      const onFilterToggle = vi.fn()
      renderToolbar({ onFilterToggle })

      const filterButton = screen.getByRole('button', { name: 'Filters' })
      await user.click(filterButton)

      expect(onFilterToggle).toHaveBeenCalledOnce()
    })
  })

  describe('chips slot', () => {
    it('renders chips when provided', () => {
      renderToolbar({
        chips: <div data-testid="test-chips">Chip content</div>,
      })

      expect(screen.getByTestId('test-chips')).toBeInTheDocument()
    })

    it('renders nothing for the chips row when no chips are provided', () => {
      const { container } = renderToolbar({ chips: undefined })

      // Only the top row should render, no second child in the toolbar container
      expect(container.querySelector('[data-testid="test-chips"]')).toBeNull()
    })
  })

  describe('view toggle slot', () => {
    it('renders view toggle slot content when provided', () => {
      renderToolbar({
        viewToggle: <button data-testid="view-toggle">Grid</button>,
      })

      expect(screen.getByTestId('view-toggle')).toBeInTheDocument()
    })
  })

  describe('no duplicate chips render', () => {
    // This test verifies that chips render ONLY inside the toolbar slot.
    // The toolbar should be the single location for chips.
    it('chips are rendered only within the toolbar, not duplicated elsewhere', () => {
      const { container } = renderToolbar({
        chips: <span data-testid="chip-in-toolbar">Active chip</span>,
      })

      const chips = container.querySelectorAll('[data-testid="chip-in-toolbar"]')
      expect(chips).toHaveLength(1)
    })
  })
})
