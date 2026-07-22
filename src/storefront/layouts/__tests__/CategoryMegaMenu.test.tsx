import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { CategoryNode } from '@/storefront/catalog/hooks/useCategoryTree'

const mockUseCategoryTree = vi.fn<() => { tree: CategoryNode[]; isLoading: boolean; isError: boolean }>()

vi.mock('@/storefront/catalog/hooks/useCategoryTree', () => ({
  useCategoryTree: () => mockUseCategoryTree(),
}))

import { CategoryMegaMenu } from '../CategoryMegaMenu'

function renderMegaMenu() {
  return render(
    <MemoryRouter>
      <CategoryMegaMenu />
    </MemoryRouter>,
  )
}

describe('CategoryMegaMenu', () => {
  afterEach(() => {
    cleanup()
    mockUseCategoryTree.mockReset()
  })

  describe('correct structure (root headings, child links)', () => {
    it('renders root categories as links and child categories as list items', () => {
      const tree: CategoryNode[] = [
        {
          id: '1',
          name: 'Electronics',
          slug: 'electronics',
          children: [
            { id: '2', name: 'Laptops', slug: 'laptops', children: [] },
            { id: '3', name: 'Phones', slug: 'phones', children: [] },
          ],
        },
        {
          id: '4',
          name: 'Clothing',
          slug: 'clothing',
          children: [
            { id: '5', name: 'Shirts', slug: 'shirts', children: [] },
          ],
        },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      renderMegaMenu()

      // Open the panel
      const trigger = screen.getByRole('button', { name: /shop by category/i })
      fireEvent.click(trigger)

      // Verify panel is visible
      const panel = screen.getByRole('region', { name: /category navigation/i })
      expect(panel).toBeInTheDocument()

      // Root categories render as links
      const electronicsLink = screen.getByRole('link', { name: 'Electronics' })
      expect(electronicsLink).toHaveAttribute('href', '/products?category=electronics')

      const clothingLink = screen.getByRole('link', { name: 'Clothing' })
      expect(clothingLink).toHaveAttribute('href', '/products?category=clothing')

      // Child categories render as list item links
      const laptopsLink = screen.getByRole('link', { name: 'Laptops' })
      expect(laptopsLink).toHaveAttribute('href', '/products?category=laptops')

      const phonesLink = screen.getByRole('link', { name: 'Phones' })
      expect(phonesLink).toHaveAttribute('href', '/products?category=phones')

      const shirtsLink = screen.getByRole('link', { name: 'Shirts' })
      expect(shirtsLink).toHaveAttribute('href', '/products?category=shirts')
    })
  })

  describe('keyboard navigation (Escape closes)', () => {
    it('pressing Escape closes the open panel', () => {
      const tree: CategoryNode[] = [
        { id: '1', name: 'Books', slug: 'books', children: [] },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      renderMegaMenu()

      // Open the panel
      const trigger = screen.getByRole('button', { name: /shop by category/i })
      fireEvent.click(trigger)

      // Panel should be open
      expect(screen.getByRole('region', { name: /category navigation/i })).toBeInTheDocument()

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' })

      // Panel should be closed
      expect(screen.queryByRole('region', { name: /category navigation/i })).not.toBeInTheDocument()
    })

    it('trigger has aria-expanded reflecting panel state', () => {
      const tree: CategoryNode[] = [
        { id: '1', name: 'Books', slug: 'books', children: [] },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      renderMegaMenu()

      const trigger = screen.getByRole('button', { name: /shop by category/i })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('outside click dismisses panel', () => {
    it('clicking outside the container closes the panel', () => {
      const tree: CategoryNode[] = [
        { id: '1', name: 'Books', slug: 'books', children: [] },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      renderMegaMenu()

      // Open the panel
      const trigger = screen.getByRole('button', { name: /shop by category/i })
      fireEvent.click(trigger)

      // Panel should be open
      expect(screen.getByRole('region', { name: /category navigation/i })).toBeInTheDocument()

      // Click outside (on document.body which is outside the container)
      fireEvent.mouseDown(document.body)

      // Panel should be closed
      expect(screen.queryByRole('region', { name: /category navigation/i })).not.toBeInTheDocument()
    })
  })

  describe('link activation closes the panel', () => {
    it('clicking a root category link closes the panel', () => {
      const tree: CategoryNode[] = [
        {
          id: '1',
          name: 'Electronics',
          slug: 'electronics',
          children: [
            { id: '2', name: 'Laptops', slug: 'laptops', children: [] },
          ],
        },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      renderMegaMenu()

      // Open the panel
      fireEvent.click(screen.getByRole('button', { name: /shop by category/i }))
      expect(screen.getByRole('region', { name: /category navigation/i })).toBeInTheDocument()

      // Click a root category link
      fireEvent.click(screen.getByRole('link', { name: 'Electronics' }))

      // Panel should close
      expect(screen.queryByRole('region', { name: /category navigation/i })).not.toBeInTheDocument()
    })

    it('clicking a child category link closes the panel', () => {
      const tree: CategoryNode[] = [
        {
          id: '1',
          name: 'Electronics',
          slug: 'electronics',
          children: [
            { id: '2', name: 'Laptops', slug: 'laptops', children: [] },
          ],
        },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      renderMegaMenu()

      // Open the panel
      fireEvent.click(screen.getByRole('button', { name: /shop by category/i }))

      // Click a child category link
      fireEvent.click(screen.getByRole('link', { name: 'Laptops' }))

      // Panel should close
      expect(screen.queryByRole('region', { name: /category navigation/i })).not.toBeInTheDocument()
    })
  })

  describe('hidden when tree is empty or error state', () => {
    it('renders nothing when tree is empty', () => {
      mockUseCategoryTree.mockReturnValue({ tree: [], isLoading: false, isError: false })

      const { container } = renderMegaMenu()

      // Component returns null
      expect(container.innerHTML).toBe('')
    })

    it('renders nothing when isError is true', () => {
      mockUseCategoryTree.mockReturnValue({ tree: [], isLoading: false, isError: true })

      const { container } = renderMegaMenu()

      // Component returns null on error
      expect(container.innerHTML).toBe('')
    })

    it('renders nothing when isError is true even with tree data', () => {
      const tree: CategoryNode[] = [
        { id: '1', name: 'Books', slug: 'books', children: [] },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: true })

      const { container } = renderMegaMenu()

      expect(container.innerHTML).toBe('')
    })
  })

  describe('>12 children truncation with "View all" link', () => {
    it('shows only the first 12 children and a "View all" link when root has more than 12 children', () => {
      const children: CategoryNode[] = Array.from({ length: 15 }, (_, i) => ({
        id: `child-${i}`,
        name: `Child ${i}`,
        slug: `child-${i}`,
        children: [],
      }))

      const tree: CategoryNode[] = [
        {
          id: 'root-1',
          name: 'Big Category',
          slug: 'big-category',
          children,
        },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      renderMegaMenu()

      // Open the panel
      fireEvent.click(screen.getByRole('button', { name: /shop by category/i }))

      // Only first 12 children should be rendered
      for (let i = 0; i < 12; i++) {
        expect(screen.getByRole('link', { name: `Child ${i}` })).toBeInTheDocument()
      }

      // Children 12, 13, 14 should NOT be rendered
      expect(screen.queryByRole('link', { name: 'Child 12' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Child 13' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Child 14' })).not.toBeInTheDocument()

      // "View all" link should be present and link to the parent's product list
      const viewAllLink = screen.getByRole('link', { name: 'View all' })
      expect(viewAllLink).toBeInTheDocument()
      expect(viewAllLink).toHaveAttribute('href', '/products?category=big-category')
    })

    it('does not show "View all" link when root has exactly 12 children', () => {
      const children: CategoryNode[] = Array.from({ length: 12 }, (_, i) => ({
        id: `child-${i}`,
        name: `Child ${i}`,
        slug: `child-${i}`,
        children: [],
      }))

      const tree: CategoryNode[] = [
        {
          id: 'root-1',
          name: 'Exact Category',
          slug: 'exact-category',
          children,
        },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      renderMegaMenu()

      // Open the panel
      fireEvent.click(screen.getByRole('button', { name: /shop by category/i }))

      // All 12 children should be rendered
      for (let i = 0; i < 12; i++) {
        expect(screen.getByRole('link', { name: `Child ${i}` })).toBeInTheDocument()
      }

      // No "View all" link
      expect(screen.queryByRole('link', { name: 'View all' })).not.toBeInTheDocument()
    })
  })
})
