import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { CategoryNode } from '@/storefront/catalog/hooks/useCategoryTree'

const mockUseCategoryTree = vi.fn<() => { tree: CategoryNode[]; isLoading: boolean; isError: boolean }>()

vi.mock('@/storefront/catalog/hooks/useCategoryTree', () => ({
  useCategoryTree: () => mockUseCategoryTree(),
}))

import { CategoryDrawerSection } from '../CategoryDrawerSection'

describe('CategoryDrawerSection', () => {
  afterEach(() => {
    cleanup()
    mockUseCategoryTree.mockReset()
  })

  describe('expand/collapse toggle', () => {
    it('clicking expand button shows children, clicking again hides them', () => {
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
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      render(
        <MemoryRouter>
          <CategoryDrawerSection onClose={vi.fn()} />
        </MemoryRouter>,
      )

      // Children should not be visible initially
      expect(screen.queryByText('Laptops')).not.toBeInTheDocument()
      expect(screen.queryByText('Phones')).not.toBeInTheDocument()

      // Click expand button
      const expandBtn = screen.getByRole('button', { name: 'Expand Electronics' })
      fireEvent.click(expandBtn)

      // Children should now be visible
      expect(screen.getByText('Laptops')).toBeInTheDocument()
      expect(screen.getByText('Phones')).toBeInTheDocument()

      // Click collapse button (aria-label changes)
      const collapseBtn = screen.getByRole('button', { name: 'Collapse Electronics' })
      fireEvent.click(collapseBtn)

      // Children should be hidden again
      expect(screen.queryByText('Laptops')).not.toBeInTheDocument()
      expect(screen.queryByText('Phones')).not.toBeInTheDocument()
    })
  })

  describe('dual affordance', () => {
    it('parent nodes render both a link (name) and a button (chevron) as separate targets', () => {
      const tree: CategoryNode[] = [
        {
          id: '1',
          name: 'Clothing',
          slug: 'clothing',
          children: [
            { id: '2', name: 'Shirts', slug: 'shirts', children: [] },
          ],
        },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      render(
        <MemoryRouter>
          <CategoryDrawerSection onClose={vi.fn()} />
        </MemoryRouter>,
      )

      // Verify link exists with correct href
      const link = screen.getByRole('link', { name: 'Clothing' })
      expect(link).toHaveAttribute('href', '/products?category=clothing')

      // Verify expand button exists as a distinct element
      const expandBtn = screen.getByRole('button', { name: 'Expand Clothing' })
      expect(expandBtn).toBeInTheDocument()

      // They are different elements
      expect(link).not.toBe(expandBtn)
    })
  })

  describe('leaf category navigation triggers close', () => {
    it('clicking a leaf category link calls onClose', () => {
      const onClose = vi.fn()
      const tree: CategoryNode[] = [
        { id: '1', name: 'Books', slug: 'books', children: [] },
      ]
      mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

      render(
        <MemoryRouter>
          <CategoryDrawerSection onClose={onClose} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link', { name: 'Books' })
      fireEvent.click(link)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('clicking a parent category link also calls onClose', () => {
      const onClose = vi.fn()
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

      render(
        <MemoryRouter>
          <CategoryDrawerSection onClose={onClose} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link', { name: 'Electronics' })
      fireEvent.click(link)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('empty/error state renders gracefully', () => {
    it('renders nothing when tree is empty', () => {
      mockUseCategoryTree.mockReturnValue({ tree: [], isLoading: false, isError: false })

      const { container } = render(
        <MemoryRouter>
          <CategoryDrawerSection onClose={vi.fn()} />
        </MemoryRouter>,
      )

      // Component returns null — container should have no meaningful content
      expect(container.innerHTML).toBe('')
    })

    it('renders nothing when isError is true', () => {
      mockUseCategoryTree.mockReturnValue({ tree: [], isLoading: false, isError: true })

      const { container } = render(
        <MemoryRouter>
          <CategoryDrawerSection onClose={vi.fn()} />
        </MemoryRouter>,
      )

      expect(container.innerHTML).toBe('')
    })
  })
})
