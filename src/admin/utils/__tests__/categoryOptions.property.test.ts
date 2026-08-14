// Feature: admin-product-sub-pages, Property 3: Parent category options exclude self and non-top-level categories

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getParentCategoryOptions } from '../categoryOptions'

/**
 * Property 3: Parent category options exclude self and non-top-level categories
 *
 * For any list of categories and a given `editingCategoryId`, `getParentCategoryOptions`
 * returns only categories where `parent === null` AND `id !== editingCategoryId`.
 * The result is a strict subset of the input list.
 *
 */

const parentArb = fc.oneof(
  fc.constant(null),
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 50 }),
  }),
)

const categoryArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  parent: parentArb,
})

const categoriesArb = fc.array(categoryArb, { minLength: 0, maxLength: 30 })

const editingCategoryIdArb = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.uuid(),
)

describe('Parent Category Options — Property Tests', () => {
  it('returns only categories where parent === null AND id !== editingCategoryId', () => {
    fc.assert(
      fc.property(
        categoriesArb,
        editingCategoryIdArb,
        (categories, editingCategoryId) => {
          const result = getParentCategoryOptions(categories, editingCategoryId)

          // Every returned category must have parent === null
          for (const cat of result) {
            expect(cat.parent).toBeNull()
          }

          // Every returned category must not be the one being edited
          if (editingCategoryId != null) {
            for (const cat of result) {
              expect(cat.id).not.toBe(editingCategoryId)
            }
          }

          // Result must contain ALL categories that match both conditions
          const expected = categories.filter(
            (cat) =>
              cat.parent === null && cat.id !== editingCategoryId,
          )
          expect(result).toEqual(expected)

          // Result is a subset of the input list
          for (const cat of result) {
            expect(categories).toContain(cat)
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
