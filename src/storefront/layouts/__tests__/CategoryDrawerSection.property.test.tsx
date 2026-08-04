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
 * Generate a tree with unique IDs AND unique slugs where at least one root
 * node has children. Uses a counter-based scheme to guarantee uniqueness
 * across the tree. Slug uniqueness is a real system invariant
 * (categories.slug is UNIQUE NOT NULL) and the assertions below locate a
 * node's link by slug — generated slug collisions made this test flake
 * (~1% of seeds; e.g. seed 309 pre-fix). Names stay duplicable: the DB has
 * no unique constraint on category name.
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
      const seq = idCounter++
      const id = `node-${seq}`
      const children: CategoryNode[] = []
      for (let i = 0; i < childCount; i++) {
        const childSeq = idCounter++
        children.push({
          id: `node-${childSeq}`,
          name: childNames[i] || `child${i}`,
          slug: `${childSlugs[i] || 'child'}-${childSeq}`,
          children: [],
        })
      }
      return { id, name, slug: `${slug}-${seq}`, children }
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

/**
 * Permanent regression example, distilled from a shrunk property-test
 * counterexample. The invalid part of that counterexample — two roots sharing
 * one slug — cannot occur in the real system, so what is pinned is the
 * realistic near-miss it exposed: duplicate NAMES across nodes (leaf root
 * between two parents) with unique slugs.
 */
const duplicateNamesExample: CategoryNode[] = [
  {
    id: 'node-1',
    name: 'aa',
    slug: 'aa-1',
    children: [{ id: 'node-2', name: 'aa', slug: 'aa-2', children: [] }],
  },
  { id: 'node-3', name: 'aa', slug: 'aa-3', children: [] },
  {
    id: 'node-4',
    name: 'aa',
    slug: 'aa-4',
    children: [{ id: 'node-5', name: 'aa', slug: 'aa-5', children: [] }],
  },
]

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

          // 2. A button for expand/collapse in the SAME row as the link (scoped to
          // the row so duplicate category names can't satisfy this vacuously)
          const expandButton = link.closest('div')?.querySelector<HTMLButtonElement>('button')
          expect(expandButton).not.toBeNull()
          expect(expandButton!.getAttribute('aria-label')).toBe(`Expand ${parent.name}`)

          // 3. They are distinct elements
          expect(link as Element).not.toBe(expandButton)
        }

        unmount()
      }),
      { numRuns: 100, examples: [[duplicateNamesExample]] },
    )
  }, 30000)
})
