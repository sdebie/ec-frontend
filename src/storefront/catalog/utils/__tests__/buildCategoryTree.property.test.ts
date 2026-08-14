import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { buildCategoryTree, type CategoryNode } from '../buildCategoryTree'

/**
 * Recursively counts all nodes in a CategoryNode tree.
 */
function countNodes(tree: CategoryNode[]): number {
  let count = 0
  for (const node of tree) {
    count += 1 + countNodes(node.children)
  }
  return count
}

/**
 * Arbitrary that generates a CategoryInput with a unique ID.
 * Uses fc.uniqueArray at the call site to guarantee ID uniqueness.
 */
const categoryRecordArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  slug: fc.string({ minLength: 1, maxLength: 30 }),
  parent: fc.option(fc.record({ id: fc.uuid() }), { nil: null }),
})

/**
 * Generates an array of CategoryInput with unique IDs.
 *
 * A raw fc.uuid() parent almost never matches another row's id, which would
 * leave the parent-child attachment path unexercised. The chain below rewires
 * a portion of parents to reference EARLIER elements in the array (acyclic by
 * construction — matching the DB, where the backend materializes ancestor
 * chains and would fail first on a cycle), while keeping null parents and
 * dangling-uuid orphans in the mix.
 */
const uniqueCategoryArrayArbitrary = fc
  .uniqueArray(categoryRecordArbitrary, {
    selector: (cat) => cat.id,
    minLength: 0,
    maxLength: 50,
  })
  .chain((cats) =>
    fc
      .array(fc.option(fc.nat(), { nil: null }), {
        minLength: cats.length,
        maxLength: cats.length,
      })
      .map((picks) =>
        cats.map((cat, i) => {
          const pick = picks[i]
          if (pick != null && i > 0 && pick % 3 !== 0) {
            return { ...cat, parent: { id: cats[pick % i].id } }
          }
          return cat
        }),
      ),
  )

describe('Feature: category-navigation, Property 1: Tree assembly preserves all categories', () => {
  /**
   * For any flat array of categories (each with an optional parent.id that may
   * be valid, null, or referencing a missing ID), buildCategoryTree SHALL produce
   * a tree whose total node count equals the input array length — no category is
   * ever dropped.
   */
  it('total node count in tree equals input array length', () => {
    fc.assert(
      fc.property(uniqueCategoryArrayArbitrary, (categories) => {
        const tree = buildCategoryTree(categories)
        expect(countNodes(tree)).toBe(categories.length)
      }),
      { numRuns: 100 },
    )
  })
})

describe('Feature: category-navigation, Property 2: Orphan and parentless categories become roots', () => {
  /**
   * For any flat category array, every category whose parent is null OR whose
   * parent.id does not appear in the array SHALL appear as a root node in the
   * output tree.
   */
  it('categories with null parent or missing parent.id appear as roots', () => {
    fc.assert(
      fc.property(uniqueCategoryArrayArbitrary, (categories) => {
        const allIds = new Set(categories.map((c) => c.id))
        const tree = buildCategoryTree(categories)
        const rootIds = new Set(tree.map((node) => node.id))

        for (const cat of categories) {
          const parentId = cat.parent?.id ?? null
          const isOrphanOrParentless = parentId === null || !allIds.has(parentId)

          if (isOrphanOrParentless) {
            expect(rootIds.has(cat.id)).toBe(true)
          }
        }
      }),
      { numRuns: 100 },
    )
  })
})
