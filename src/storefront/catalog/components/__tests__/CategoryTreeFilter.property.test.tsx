import { describe, it, expect, vi, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup, fireEvent } from '@testing-library/react'
import type { CategoryNode } from '@/storefront/catalog/hooks/useCategoryTree'

/**
 * Feature: category-navigation
 * Property 6: FilterSidebar tree indentation reflects hierarchy
 *
 * For any category tree rendered in the FilterSidebar, child categories SHALL
 * have greater indentation (measured by CSS class) than their parent category
 * up to the depth-3 indent cap; at or beyond the cap, indentation SHALL be
 * non-decreasing.
 *
 */

const mockUseCategoryTree = vi.fn<() => { tree: CategoryNode[]; isLoading: boolean; isError: boolean }>()

vi.mock('@/storefront/catalog/hooks/useCategoryTree', () => ({
  useCategoryTree: () => mockUseCategoryTree(),
}))

// --- Helpers ---

const INDENT_CLASSES = ['pl-0', 'pl-4', 'pl-8', 'pl-12']

/**
 * Extract the indent level (0–3) from a button element's className.
 * Returns the index of the matching indent class in INDENT_CLASSES.
 */
function getIndentLevel(className: string): number {
  for (let i = INDENT_CLASSES.length - 1; i >= 0; i--) {
    if (className.includes(INDENT_CLASSES[i])) {
      return i
    }
  }
  return -1
}

/**
 * Recursively collect (parentName, childName, parentDepth, childDepth) pairs
 * from a tree to verify indentation ordering.
 */
function collectParentChildPairs(
  nodes: CategoryNode[],
  depth: number,
): Array<{ parentName: string; childName: string; parentDepth: number; childDepth: number }> {
  const pairs: Array<{
    parentName: string
    childName: string
    parentDepth: number
    childDepth: number
  }> = []

  for (const node of nodes) {
    for (const child of node.children) {
      pairs.push({
        parentName: node.name,
        childName: child.name,
        parentDepth: depth,
        childDepth: depth + 1,
      })
    }
    // Recurse for deeper levels
    pairs.push(...collectParentChildPairs(node.children, depth + 1))
  }

  return pairs
}

// --- Arbitraries ---

// Use unique, identifiable names to find buttons by text content
let nameCounter = 0
function resetNameCounter() {
  nameCounter = 0
}

const nameArb = fc.stringMatching(/^[A-Z][a-z]{2,10}$/)
const slugArb = fc.stringMatching(/^[a-z]{3,10}$/)

/**
 * Generate a tree with unique names using a mapped arbitrary.
 * maxDepth bounds recursion to avoid stack overflow.
 */
function categoryNodeArb(maxDepth: number): fc.Arbitrary<CategoryNode> {
  const leaf: fc.Arbitrary<CategoryNode> = fc
    .tuple(nameArb, slugArb)
    .map(([name, slug]) => ({
      id: `id-${++nameCounter}`,
      name: `${name}${nameCounter}`,
      slug: `${slug}${nameCounter}`,
      children: [] as CategoryNode[],
    }))

  if (maxDepth <= 0) return leaf

  return fc
    .tuple(nameArb, slugArb, fc.array(categoryNodeArb(maxDepth - 1), { minLength: 0, maxLength: 4 }))
    .map(([name, slug, children]) => ({
      id: `id-${++nameCounter}`,
      name: `${name}${nameCounter}`,
      slug: `${slug}${nameCounter}`,
      children,
    }))
}

// Tree with at least one parent-child relationship
const treeWithHierarchy: fc.Arbitrary<CategoryNode[]> = fc
  .tuple(
    // At least one node with children (to guarantee parent-child pairs exist)
    fc
      .tuple(nameArb, slugArb, fc.array(categoryNodeArb(1), { minLength: 1, maxLength: 4 }))
      .map(([name, slug, children]) => ({
        id: `id-${++nameCounter}`,
        name: `${name}${nameCounter}`,
        slug: `${slug}${nameCounter}`,
        children,
      })),
    // Additional roots (possibly with children)
    fc.array(categoryNodeArb(2), { minLength: 0, maxLength: 5 }),
  )
  .map(([requiredParent, rest]) => [requiredParent, ...rest])

describe('Feature: category-navigation, Property 6: FilterSidebar tree indentation reflects hierarchy', () => {
  afterEach(() => {
    cleanup()
  })

  it('child categories have greater indentation than their parent (capped at pl-12)', async () => {
    const { CategoryTreeFilter } = await import('../CategoryTreeFilter')

    fc.assert(
      fc.property(treeWithHierarchy, (tree) => {
        resetNameCounter()
        mockUseCategoryTree.mockReturnValue({ tree, isLoading: false, isError: false })

        const { container, unmount } = render(
          <CategoryTreeFilter activeSlug="" setFilter={vi.fn()} />,
        )

        // The tree ships collapsed (sidebar-height fix), so expand every node
        // before asserting — the property is about indentation, not visibility.
        for (;;) {
          const toggles = Array.from(
            container.querySelectorAll<HTMLButtonElement>('button[aria-expanded="false"]'),
          )
          if (toggles.length === 0) break
          toggles.forEach((toggle) => fireEvent.click(toggle))
        }

        // Collect all parent-child pairs from the tree with their expected depths
        const pairs = collectParentChildPairs(tree, 0)

        // For each pair, find the buttons by text content and compare indent levels
        const buttons = container.querySelectorAll<HTMLButtonElement>('button')
        const buttonByName = new Map<string, HTMLButtonElement>()
        buttons.forEach((btn) => {
          const text = btn.textContent?.trim()
          if (text) {
            buttonByName.set(text, btn)
          }
        })

        for (const { parentName, childName, parentDepth, childDepth } of pairs) {
          const parentButton = buttonByName.get(parentName)
          const childButton = buttonByName.get(childName)

          // Both buttons must exist
          expect(parentButton, `Parent button "${parentName}" not found`).toBeDefined()
          expect(childButton, `Child button "${childName}" not found`).toBeDefined()

          if (!parentButton || !childButton) continue

          const parentIndent = getIndentLevel(parentButton.className)
          const childIndent = getIndentLevel(childButton.className)

          // Both must have a valid indent class
          expect(parentIndent).toBeGreaterThanOrEqual(0)
          expect(childIndent).toBeGreaterThanOrEqual(0)

          // Property assertion: child indent >= parent indent (non-decreasing)
          // AND if parent is below the cap (depth < 3), child must be strictly greater
          const parentCapped = parentDepth >= 3
          const childCapped = childDepth >= 3

          if (parentCapped && childCapped) {
            // Both at or beyond cap — indentation is equal (both pl-12)
            expect(childIndent).toBeGreaterThanOrEqual(parentIndent)
          } else {
            // Child must have strictly greater indentation than parent
            expect(childIndent).toBeGreaterThan(parentIndent)
          }
        }

        unmount()
      }),
      { numRuns: 100 },
    )
  }, 30000)
})
