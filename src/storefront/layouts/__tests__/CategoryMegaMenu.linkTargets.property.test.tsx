import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryMegaMenu } from '../CategoryMegaMenu'
import type { CategoryNode } from '@/storefront/catalog/hooks/useCategoryTree'

vi.mock('@/storefront/catalog/hooks/useCategoryTree')

import { useCategoryTree } from '@/storefront/catalog/hooks/useCategoryTree'

const mockedUseCategoryTree = vi.mocked(useCategoryTree)

/**
 * Arbitrary for URL-safe slugs (lowercase letters, digits, hyphens).
 * Starts with a letter to avoid edge cases with leading hyphens.
 */
const slugArbitrary = fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/)

/**
 * Generates a CategoryNode with children at a fixed max depth of 2.
 * Uses explicit depth-limiting to avoid stack overflow in fast-check's recursive generation.
 */
function makeCategoryNodeArbitrary(maxDepth: number): fc.Arbitrary<CategoryNode> {
  if (maxDepth <= 0) {
    return fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 20 }),
      slug: slugArbitrary,
      children: fc.constant([] as CategoryNode[]),
    })
  }
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    slug: slugArbitrary,
    children: fc.array(makeCategoryNodeArbitrary(maxDepth - 1), { maxLength: 5 }),
  })
}

const treeArbitrary = fc.array(makeCategoryNodeArbitrary(2), { minLength: 1, maxLength: 8 })

/**
 * Collects all slugs from a tree up to the visible depth (roots + up to 12 children per root).
 */
function collectVisibleSlugs(tree: CategoryNode[]): string[] {
  const slugs: string[] = []
  for (const root of tree) {
    slugs.push(root.slug)
    for (const child of root.children.slice(0, 12)) {
      slugs.push(child.slug)
    }
  }
  return slugs
}

describe('Feature: category-navigation, Property 4: Category link targets are correct', () => {
  /**
   * For any category node (root or child) rendered in the mega-menu,
   * the navigation target SHALL contain `/products?category={slug}` for that
   * category's slug as the filter parameter.
   */
  it('each rendered link href contains /products?category={slug} for the correct category', () => {
    fc.assert(
      fc.property(treeArbitrary, (tree) => {
        mockedUseCategoryTree.mockReturnValue({
          tree,
          isLoading: false,
          isError: false,
        })

        const { container, unmount } = render(
          <MemoryRouter>
            <CategoryMegaMenu />
          </MemoryRouter>,
        )

        // Click the trigger to open the panel
        const trigger = container.querySelector('button')
        expect(trigger).not.toBeNull()
        fireEvent.click(trigger!)

        // Get all links in the panel
        const panel = container.querySelector('#category-mega-menu-panel')
        expect(panel).not.toBeNull()

        const links = panel!.querySelectorAll('a')
        const hrefs = Array.from(links).map((link) => link.getAttribute('href'))

        // Verify each visible category slug has a corresponding link
        const visibleSlugs = collectVisibleSlugs(tree)

        for (const slug of visibleSlugs) {
          const expectedHref = `/products?category=${slug}`
          const found = hrefs.some((href) => href === expectedHref)
          expect(found, `Expected to find link with href "${expectedHref}"`).toBe(true)
        }

        unmount()
      }),
      { numRuns: 100 },
    )
  })
})
