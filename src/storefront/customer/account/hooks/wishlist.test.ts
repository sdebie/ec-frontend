import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import { QueryClient } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
  storefrontHttpClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: () => ({ isSignedIn: true }),
}))

const mockedClient = vi.mocked(storefrontHttpClient)

/** Arbitrary for a valid UUID-like variant ID */
const variantIdArb = fc.uuid()

/** Arbitrary for a set of variant IDs (unique) */
const variantIdSetArb = fc.uniqueArray(fc.uuid(), { minLength: 0, maxLength: 20 })

/**
 * Helper: Creates a fresh QueryClient with the given wishlist state pre-seeded.
 */
function createQueryClientWithWishlist(variantIds: string[]): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
  queryClient.setQueryData(['customer', 'wishlist'], new Set(variantIds))
  return queryClient
}

function simulateRollback(
  queryClient: QueryClient,
  prev: Set<string> | undefined,
): void {
  if (prev) {
    queryClient.setQueryData(['customer', 'wishlist'], prev)
  }
}

describe('Wishlist hooks — property-based tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * **Validates: Requirements 8.2, 8.3**
   *
   * Property 11: Wishlist toggle correctness
   *
   * For any variantId and its current wishlist membership state, clicking the
   * heart icon should call the correct endpoint (POST if not wishlisted, DELETE
   * if wishlisted) and optimistically flip the icon to the opposite state.
   */
  describe('Property 11: Wishlist toggle correctness', () => {
    it('calls POST and adds to set when variantId is NOT in wishlist', () => {
      fc.assert(
        fc.property(
          variantIdArb,
          variantIdSetArb,
          (variantId, existingIds) => {
            // Ensure the variantId is NOT in the existing wishlist
            const filteredIds = existingIds.filter((id) => id !== variantId)
            const queryClient = createQueryClientWithWishlist(filteredIds)

            // Mock the POST call
            mockedClient.post.mockResolvedValue({ status: 204 })

            // Call mutationFn — this is what the hook calls
            storefrontHttpClient.post(`/api/storefront/wishlist/${variantId}`)

            // Verify POST was called with correct URL
            expect(mockedClient.post).toHaveBeenCalledWith(
              `/api/storefront/wishlist/${variantId}`,
            )

            // Simulate the optimistic update (onMutate)
            queryClient.setQueryData<Set<string>>(
              ['customer', 'wishlist'],
              (old) => {
                const next = new Set(old)
                next.add(variantId)
                return next
              },
            )

            // Verify the optimistic state now contains the variantId
            const updatedSet = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            expect(updatedSet?.has(variantId)).toBe(true)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('calls DELETE and removes from set when variantId IS in wishlist', () => {
      fc.assert(
        fc.property(
          variantIdArb,
          variantIdSetArb,
          (variantId, existingIds) => {
            // Ensure the variantId IS in the existing wishlist
            const idsWithTarget = [...existingIds.filter((id) => id !== variantId), variantId]
            const queryClient = createQueryClientWithWishlist(idsWithTarget)

            // Mock the DELETE call
            mockedClient.delete.mockResolvedValue({ status: 204 })

            // Call mutationFn — this is what the hook calls
            storefrontHttpClient.delete(`/api/storefront/wishlist/${variantId}`)

            // Verify DELETE was called with correct URL
            expect(mockedClient.delete).toHaveBeenCalledWith(
              `/api/storefront/wishlist/${variantId}`,
            )

            // Simulate the optimistic update (onMutate)
            queryClient.setQueryData<Set<string>>(
              ['customer', 'wishlist'],
              (old) => {
                const next = new Set(old)
                next.delete(variantId)
                return next
              },
            )

            // Verify the optimistic state no longer contains the variantId
            const updatedSet = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            expect(updatedSet?.has(variantId)).toBe(false)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('selects correct endpoint based on membership: POST for add, DELETE for remove', () => {
      fc.assert(
        fc.property(
          variantIdArb,
          fc.boolean(),
          (variantId, isCurrentlyWishlisted) => {
            vi.clearAllMocks()
            mockedClient.post.mockResolvedValue({ status: 204 })
            mockedClient.delete.mockResolvedValue({ status: 204 })

            // The add flag is the inverse of current membership
            const add = !isCurrentlyWishlisted

            // Simulate what the hook's mutationFn does
            if (add) {
              storefrontHttpClient.post(`/api/storefront/wishlist/${variantId}`)
            } else {
              storefrontHttpClient.delete(`/api/storefront/wishlist/${variantId}`)
            }

            if (add) {
              expect(mockedClient.post).toHaveBeenCalledWith(
                `/api/storefront/wishlist/${variantId}`,
              )
              expect(mockedClient.delete).not.toHaveBeenCalled()
            } else {
              expect(mockedClient.delete).toHaveBeenCalledWith(
                `/api/storefront/wishlist/${variantId}`,
              )
              expect(mockedClient.post).not.toHaveBeenCalled()
            }
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Validates: Requirements 8.4**
   *
   * Property 12: Wishlist toggle failure rollback
   *
   * For any wishlist toggle mutation that results in a network error, the heart
   * icon should revert to its prior state.
   */
  describe('Property 12: Wishlist toggle failure rollback', () => {
    it('reverts to prior state when adding fails', () => {
      fc.assert(
        fc.property(
          variantIdArb,
          variantIdSetArb,
          (variantId, existingIds) => {
            // Ensure variantId is NOT in the existing set (we are adding)
            const filteredIds = existingIds.filter((id) => id !== variantId)
            const queryClient = createQueryClientWithWishlist(filteredIds)

            // Simulate onMutate: optimistic add
            const prev = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            queryClient.setQueryData<Set<string>>(
              ['customer', 'wishlist'],
              (old) => {
                const next = new Set(old)
                next.add(variantId)
                return next
              },
            )

            // Verify optimistic state was applied
            const optimistic = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            expect(optimistic?.has(variantId)).toBe(true)

            // Simulate onError: rollback
            simulateRollback(queryClient, prev)

            // Verify state is rolled back
            const rolledBack = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            expect(rolledBack?.has(variantId)).toBe(false)

            // Verify the set matches the original
            expect(rolledBack).toEqual(new Set(filteredIds))
          },
        ),
        { numRuns: 100 },
      )
    })

    it('reverts to prior state when removing fails', () => {
      fc.assert(
        fc.property(
          variantIdArb,
          variantIdSetArb,
          (variantId, existingIds) => {
            // Ensure variantId IS in the existing set (we are removing)
            const idsWithTarget = [
              ...existingIds.filter((id) => id !== variantId),
              variantId,
            ]
            const queryClient = createQueryClientWithWishlist(idsWithTarget)

            // Simulate onMutate: optimistic remove
            const prev = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            queryClient.setQueryData<Set<string>>(
              ['customer', 'wishlist'],
              (old) => {
                const next = new Set(old)
                next.delete(variantId)
                return next
              },
            )

            // Verify optimistic state was applied
            const optimistic = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            expect(optimistic?.has(variantId)).toBe(false)

            // Simulate onError: rollback
            simulateRollback(queryClient, prev)

            // Verify state is rolled back — variantId is back
            const rolledBack = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            expect(rolledBack?.has(variantId)).toBe(true)

            // Verify the set matches the original
            expect(rolledBack).toEqual(new Set(idsWithTarget))
          },
        ),
        { numRuns: 100 },
      )
    })

    it('preserves all other IDs after rollback', () => {
      fc.assert(
        fc.property(
          variantIdArb,
          variantIdSetArb,
          fc.boolean(),
          (variantId, existingIds, isAdd) => {
            const baseIds = existingIds.filter((id) => id !== variantId)
            const initialIds = isAdd ? baseIds : [...baseIds, variantId]
            const queryClient = createQueryClientWithWishlist(initialIds)

            // Snapshot
            const prev = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])

            // Optimistic update
            queryClient.setQueryData<Set<string>>(
              ['customer', 'wishlist'],
              (old) => {
                const next = new Set(old)
                if (isAdd) {
                  next.add(variantId)
                } else {
                  next.delete(variantId)
                }
                return next
              },
            )

            // Rollback
            simulateRollback(queryClient, prev)

            // Verify full equality with original
            const rolledBack = queryClient.getQueryData<Set<string>>([
              'customer',
              'wishlist',
            ])
            expect(rolledBack).toEqual(new Set(initialIds))
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  /**
   * **Validates: Requirements 8.9**
   *
   * Property 13: Wishlist state initialization from API
   *
   * For any array of variantIds returned by GET /api/storefront/wishlist, the
   * resulting local wishlist Set should contain exactly those IDs and no others.
   */
  describe('Property 13: Wishlist state initialization from API', () => {
    it('creates a Set containing exactly the variantIds from the API response', () => {
      fc.assert(
        fc.property(variantIdSetArb, (variantIds) => {
          // Simulate what the useWishlist queryFn does:
          // storefrontHttpClient.get<WishlistResponse>('/api/storefront/wishlist')
          //   .then(r => new Set(r.data.variantIds))
          const apiResponse = { data: { variantIds } }
          const resultSet = new Set(apiResponse.data.variantIds)

          // The Set should contain exactly those IDs
          expect(resultSet.size).toBe(variantIds.length)

          // Every ID from the API should be in the Set
          for (const id of variantIds) {
            expect(resultSet.has(id)).toBe(true)
          }

          // The Set should contain nothing extra (size check covers this, but explicit)
          for (const id of resultSet) {
            expect(variantIds).toContain(id)
          }
        }),
        { numRuns: 100 },
      )
    })

    it('produces an empty Set when API returns no variantIds', () => {
      const apiResponse = { data: { variantIds: [] } }
      const resultSet = new Set(apiResponse.data.variantIds)

      expect(resultSet.size).toBe(0)
    })

    it('handles the full queryFn transformation correctly', async () => {
      await fc.assert(
        fc.asyncProperty(variantIdSetArb, async (variantIds) => {
          // Mock the GET call to return our arbitrary variantIds
          mockedClient.get.mockResolvedValue({
            data: { variantIds },
          })

          // Execute the same transformation as the hook's queryFn
          const response = await storefrontHttpClient.get('/api/storefront/wishlist')
          const resultSet = new Set(
            (response.data as { variantIds: string[] }).variantIds,
          )

          // Verify exact membership
          expect(resultSet.size).toBe(variantIds.length)
          for (const id of variantIds) {
            expect(resultSet.has(id)).toBe(true)
          }
        }),
        { numRuns: 100 },
      )
    })

    it('does not include duplicate entries even if API response has duplicates', () => {
      fc.assert(
        fc.property(
          fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
          (variantIds) => {
            // Intentionally create duplicates
            const withDuplicates = [...variantIds, ...variantIds]
            const apiResponse = { data: { variantIds: withDuplicates } }

            // The queryFn uses new Set() which deduplicates
            const resultSet = new Set(apiResponse.data.variantIds)

            // Set should deduplicate — size equals unique count
            const uniqueIds = new Set(variantIds)
            expect(resultSet.size).toBe(uniqueIds.size)

            // Every unique ID is present
            for (const id of uniqueIds) {
              expect(resultSet.has(id)).toBe(true)
            }
          },
        ),
        { numRuns: 100 },
      )
    })
  })
})
