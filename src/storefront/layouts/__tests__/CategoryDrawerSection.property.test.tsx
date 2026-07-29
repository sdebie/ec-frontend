import { describe, it, expect, vi, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { CategoryNode } from '@/storefront/catalog/hooks/useCategoryTree'

/**
 * Property 5: Drawer parent nodes have dual affordances
 *
 * For any category node that has children, the NavDrawer SHALL render two
 * distinct interactive elements: one that navigates to the parent's product
 * list (a link), and one that expands/collapses the children list (a button).
 *
 * **Validates: Requirements 3.1, 3.2**
 */

const mockUseCategoryTree = vi.fn<() => { tree: CategoryNode[]; isLoading: boolean; isError: boolean }>()

vi.mock('@/storefront/catalog/hooks/useCategoryTree', () => ({
  useCategoryTree: () => mockUseCategoryTree(),
}))

// --- Arbitraries ---

// Use alphanumeric strings to avoid whitespace-only accessible names
const nameArb = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{0,14}[a-zA-Z0-9]$/)
const slugArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,14}[a-z0-9]$/)

/**
 * Generate a tree with unique IDs where at least one root node has children.
 * Uses a counter-based ID scheme to guarantee uniqueness across the tree.
 */
const treeWithParents: fc.Arbitrary<CategoryNode[]> = fc
  .tuple(
    // At least one parent node (with children)
    fc.record({
      name: nameArb,
      slug: slugArb,
      childCount: fc.integer({ min: 1, max: 5 }),
      childNames: fc.array(nameArb, { minLength: 5, maxLength: 5 }),
      childSlugs: fc.array(slugArb, { minLength: 5, maxLength: 5 }),
    }),
    // Additional root nodes (mix of parents and leaves)
    fc.array(
      fc.record({
        name: nameArb,
        slug: slugArb,
        childCount: fc.integer({ min: 0, max: 4 }),
        childNames: fc.array(nameArb, { minLength: 4, maxLength: 4 }),
        childSlugs: fc.array(slugArb, { minLength: 4, maxLength: 4 }),
      }),
      { maxLength: 6 },
    ),
  )
  .map(([requiredParent, rest]) => {
    let idCounter = 1

    function buildNode(
      name: string,
      slug: string,
      childCount: number,
      childNames: string[],
      childSlugs: string[],
    ): CategoryNode {
      const id = `node-${idCounter++}`
      const children: CategoryNode[] = []
      for (let i = 0; i < childCount; i++) {
        children.push({
          id: `node-${idCounter++}`,
          name: childNames[i] || `child${i}`,
          slug: childSlugs[i] || `child-${i}`,
          children: [],
        })
      }
      return { id, name, slug, children }
    }

    const nodes: CategoryNode[] = [
      buildNode(
        requiredParent.name,
        requiredParent.slug,
        requiredParent.childCount,
        requiredParent.childNames,
        requiredParent.childSlugs,
      ),
      ...rest.map((r) => buildNode(r.name, r.slug, r.childCount, r.childNames, r.childSlugs)),
    ]
    return nodes
  })

describe('Feature: category-navigation, Property 5: Drawer parent nodes have dual affordances', () => {
  afterEach(() => {
    cleanup()
  })

  it('every parent node at root level has both a navigation link and an expand/collapse button', async () => {
    const { CategoryDrawerSection } = await import('../CategoryDrawerSection')

    fc.assert(
      fc.property(treeWithParents, (tree) => {
        mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

        const { container, unmount } = render(
          <MemoryRouter>
            <CategoryDrawerSection onClose={vi.fn()} />
          </MemoryRouter>,
        )

        // For each root-level parent node (has children), verify dual affordances
        const parentNodes = tree.filter((node) => node.children.length > 0)

        for (const parent of parentNodes) {
          // 1. A link element for navigation — find by href containing the slug
          const links = container.querySelectorAll<HTMLAnchorElement>(
            `a[href="/products?category=${parent.slug}"]`,
          )
          expect(links.length).toBeGreaterThanOrEqual(1)
          const link = links[0]

          // Verify link text contains the category name
          expect(link.textContent?.trim()).toBe(parent.name)

          // 2. A button for expand/collapse with aria-label referencing the category name
          const expandButton = container.querySelector<HTMLButtonElement>(
            `button[aria-label="Expand ${parent.name}"]`,
          )
          expect(expandButton).not.toBeNull()

          // 3. They are distinct elements
          expect(link).not.toBe(expandButton)
        }

        unmount()
      }),
      { numRuns: 100 },
    )
  }, 30000)
})
