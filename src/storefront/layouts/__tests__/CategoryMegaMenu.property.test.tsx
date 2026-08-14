import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as fc from 'fast-check'
import type { CategoryNode } from '@/storefront/catalog/utils/buildCategoryTree'

/**
 * Feature: category-navigation
 * Property 3: Mega-menu renders all root categories with correct children
 *
 * For any category tree, the CategoryMegaMenu panel SHALL render one group per
 * root node, and each group SHALL contain links for exactly that root's direct
 * children (up to 12, since >12 are truncated with a "View all" link).
 */

vi.mock('@/storefront/catalog/hooks/useCategoryTree', () => ({
  useCategoryTree: vi.fn(),
}))

import { useCategoryTree } from '@/storefront/catalog/hooks/useCategoryTree'
import { CategoryMegaMenu } from '../CategoryMegaMenu'

// --- Arbitraries ---

/**
 * Build a CategoryNode arbitrary with bounded depth to avoid stack overflow.
 * maxDepth=0 produces leaf nodes, maxDepth=1 produces nodes with leaf children, etc.
 */
function categoryNodeArb(maxDepth: number): fc.Arbitrary<CategoryNode> {
  const leaf: fc.Arbitrary<CategoryNode> = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    slug: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    children: fc.constant([] as CategoryNode[]),
  })

  if (maxDepth <= 0) return leaf

  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    slug: fc.string({ minLength: 1, maxLength: 20 }).filter((s) => s.trim().length > 0),
    children: fc.array(categoryNodeArb(maxDepth - 1), { maxLength: 5 }),
  })
}

const treeArbitrary = fc.array(categoryNodeArb(2), { minLength: 1, maxLength: 10 })

// --- Helpers ---

function renderMegaMenu() {
  return render(
    <MemoryRouter>
      <CategoryMegaMenu />
    </MemoryRouter>,
  )
}

describe('CategoryMegaMenu — Property 3: Mega-menu renders all root categories with correct children', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders one group per root and shows correct child links (max 12) for each root', () => {
    fc.assert(
      fc.property(treeArbitrary, (tree) => {
        vi.mocked(useCategoryTree).mockReturnValue({
          tree,
          isLoading: false,
          isError: false,
        })

        const { unmount } = renderMegaMenu()

        // Open the panel by clicking the trigger button
        const trigger = screen.getByRole('button', { name: /shop by category/i })
        fireEvent.click(trigger)

        // The panel should now be visible
        const panel = screen.getByRole('region', { name: /category navigation/i })

        // Each root category renders as a link (heading-style) — verify count matches
        // The root links are the top-level links in each group div
        const groups = panel.querySelectorAll(':scope > div > div > div')
        expect(groups.length).toBe(tree.length)

        // For each root, verify children rendered match root.children.slice(0, 12)
        tree.forEach((root, index) => {
          const group = groups[index]

          // Root name appears as a link
          const rootLink = group.querySelector('a')
          expect(rootLink).not.toBeNull()
          expect(rootLink!.textContent).toBe(root.name)

          // Child links are in a <ul> if children exist
          const expectedChildren = root.children.slice(0, 12)

          if (expectedChildren.length > 0) {
            const listItems = group.querySelectorAll('ul > li > a')
            // If root has >12 children, there's also a "View all" link
            const viewAllCount = root.children.length > 12 ? 1 : 0
            const totalListLinks = group.querySelectorAll('ul > li a')
            expect(totalListLinks.length).toBe(expectedChildren.length + viewAllCount)

            // Verify each child link text matches
            expectedChildren.forEach((child, childIndex) => {
              expect(listItems[childIndex].textContent).toBe(child.name)
            })
          } else {
            // No <ul> when there are no children
            const ul = group.querySelector('ul')
            expect(ul).toBeNull()
          }
        })

        unmount()
      }),
      { numRuns: 100 },
    )
  })
})
