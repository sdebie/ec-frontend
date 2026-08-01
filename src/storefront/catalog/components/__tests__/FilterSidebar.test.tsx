import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterSidebar } from '../FilterSidebar'

// Mock CategoryTreeFilter since it has its own data dependencies
vi.mock('../CategoryTreeFilter', () => ({
  CategoryTreeFilter: ({ activeSlug }: { activeSlug: string }) => (
    <div data-testid="category-tree">{activeSlug || 'all'}</div>
  ),
}))

const defaultProps = {
  brands: [{ id: '1', name: 'Nike', slug: 'nike' }],
  activeFilters: { search: '', category: '', brand: '' },
  setFilter: vi.fn(),
  onClearAll: vi.fn(),
  drawerOpen: false,
  onDrawerClose: vi.fn(),
  sidebarVisible: true,
}

describe('FilterSidebar', () => {
  describe('desktop sidebar visibility', () => {
    it('renders the desktop aside when sidebarVisible is true', () => {
      render(<FilterSidebar {...defaultProps} sidebarVisible={true} />)

      const aside = screen.getByRole('complementary')
      expect(aside).toBeInTheDocument()
      expect(aside).toHaveClass('hidden', 'md:block', 'w-64')
    })

    it('does not render the desktop aside when sidebarVisible is false', () => {
      render(<FilterSidebar {...defaultProps} sidebarVisible={false} />)

      expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    })

    it('defaults sidebarVisible to true when prop is omitted', () => {
      const { sidebarVisible: _, ...propsWithoutSidebarVisible } = defaultProps
      render(<FilterSidebar {...propsWithoutSidebarVisible} />)

      expect(screen.getByRole('complementary')).toBeInTheDocument()
    })
  })

  describe('mobile drawer close button', () => {
    it('renders "View results" button in the drawer', () => {
      render(<FilterSidebar {...defaultProps} drawerOpen={true} />)

      expect(screen.getByRole('button', { name: /view results/i })).toBeInTheDocument()
    })

    it('closes the drawer when "View results" is clicked', async () => {
      const user = userEvent.setup()
      const onDrawerClose = vi.fn()

      render(
        <FilterSidebar {...defaultProps} drawerOpen={true} onDrawerClose={onDrawerClose} />,
      )

      await user.click(screen.getByRole('button', { name: /view results/i }))
      expect(onDrawerClose).toHaveBeenCalledTimes(1)
    })

    it('does not render an X icon close button in the drawer', () => {
      render(<FilterSidebar {...defaultProps} drawerOpen={true} />)

      // The old X button had aria-label "Close filters"
      expect(screen.queryByLabelText('Close filters')).not.toBeInTheDocument()
    })
  })

  describe('full-width grid when sidebar hidden', () => {
    it('when sidebarVisible is false the aside is absent so flex-1 content fills the parent', () => {
      render(<FilterSidebar {...defaultProps} sidebarVisible={false} />)

      // No aside is rendered — the flex container in the parent page
      // will naturally let flex-1 fill the full width
      expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    })
  })
})
