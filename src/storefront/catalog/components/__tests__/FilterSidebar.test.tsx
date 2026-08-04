import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

    it('renders an X close button in the drawer header that closes the drawer', async () => {
      // The original design had "View results" as the drawer's only closer;
      // the owner then asked for a clear header close button as well — both
      // close, the sticky footer "View results" remains the primary action.
      const user = userEvent.setup()
      const onDrawerClose = vi.fn()
      render(<FilterSidebar {...defaultProps} drawerOpen={true} onDrawerClose={onDrawerClose} />)

      await user.click(screen.getByLabelText('Close filters'))
      expect(onDrawerClose).toHaveBeenCalledTimes(1)
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

  /*
    Two independent ways the sidebar search stops working, one test each:

      1. A resync guard comparing local state to the URL reverts the term during
         render at the moment the debounce settles — when the two must differ —
         so nothing typed reaches setFilter.
      2. Writing a key other than the canonical `q` lets an active header search
         shadow anything typed here.
  */
  describe('search field', () => {
    it('publishes what was typed, under the canonical q key, after the debounce', async () => {
      const user = userEvent.setup()
      const setFilter = vi.fn()
      render(<FilterSidebar {...defaultProps} setFilter={setFilter} />)

      await user.type(screen.getByLabelText('Search'), 'gloves')

      // 350ms debounce — waitFor outlasts it without a fake-timer setup.
      await waitFor(() => expect(setFilter).toHaveBeenCalledWith('q', 'gloves'), {timeout: 2000})
    })

    it('still publishes when a search is already active — the active term must not shadow the typed one', async () => {
      const user = userEvent.setup()
      const setFilter = vi.fn()
      render(
        <FilterSidebar
          {...defaultProps}
          activeFilters={{search: 'blanket', category: '', brand: ''}}
          setFilter={setFilter}
        />,
      )

      const input = screen.getByLabelText('Search')
      expect(input).toHaveValue('blanket')

      await user.clear(input)
      await user.type(input, 'gloves')

      await waitFor(() => expect(setFilter).toHaveBeenCalledWith('q', 'gloves'), {timeout: 2000})
      // …and the box keeps what was typed rather than snapping back.
      expect(input).toHaveValue('gloves')
    })

    it('adopts an externally changed term (Clear all, the chip, the header bar)', () => {
      const {rerender} = render(
        <FilterSidebar {...defaultProps} activeFilters={{search: 'blanket', category: '', brand: ''}} />,
      )
      expect(screen.getByLabelText('Search')).toHaveValue('blanket')

      rerender(<FilterSidebar {...defaultProps} activeFilters={{search: '', category: '', brand: ''}} />)
      expect(screen.getByLabelText('Search')).toHaveValue('')
    })

    /*
      Adopting must be SILENT. This one only surfaced in the browser: a header
      search set ?q=blanket, the sidebar adopted it, and then published a stale
      empty string straight back — wiping the search a fraction of a second after
      it was applied. The URL visibly went ?q=blanket → ?page=1 on its own.

      The cause was an intermediate `debouncedValue` state that could hold the
      PREVIOUS term while the input and the resync guard already held the new one.
      Collapsing to a single draft state removed the value that could go stale;
      this guards the behaviour rather than that particular mechanism.
    */
    it('publishes NOTHING when it adopts an external term — a header search must survive', async () => {
      const setFilter = vi.fn()
      const {rerender} = render(
        <FilterSidebar {...defaultProps} activeFilters={{search: '', category: '', brand: ''}} setFilter={setFilter} />,
      )

      // The header bar applies a term; the URL changes underneath the sidebar.
      rerender(
        <FilterSidebar {...defaultProps} activeFilters={{search: 'blanket', category: '', brand: ''}} setFilter={setFilter} />,
      )
      expect(screen.getByLabelText('Search')).toHaveValue('blanket')

      // Outlast the 350ms debounce: nothing may be written back at any point.
      await new Promise((resolve) => setTimeout(resolve, 700))
      expect(setFilter).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Search')).toHaveValue('blanket')
    })

    it('publishes nothing when an external term is cleared either', async () => {
      const setFilter = vi.fn()
      const {rerender} = render(
        <FilterSidebar {...defaultProps} activeFilters={{search: 'blanket', category: '', brand: ''}} setFilter={setFilter} />,
      )

      rerender(
        <FilterSidebar {...defaultProps} activeFilters={{search: '', category: '', brand: ''}} setFilter={setFilter} />,
      )

      await new Promise((resolve) => setTimeout(resolve, 700))
      expect(setFilter).not.toHaveBeenCalled()
    })
  })
})
