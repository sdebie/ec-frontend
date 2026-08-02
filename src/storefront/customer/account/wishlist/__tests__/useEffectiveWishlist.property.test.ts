// Feature: wishlist-completion, Property 5: Effective wishlist reflects auth state

import {beforeEach, describe, expect, it, vi} from 'vitest'
import * as fc from 'fast-check'
// Import after mocks are set up
import {useEffectiveWishlist} from '../hooks/useEffectiveWishlist'

/**
 * Validates: Requirements 1.3, 1.4, 2.1, 4.4
 *
 * Property 5: Effective wishlist reflects auth state — for any auth state,
 * `useEffectiveWishlist` returns local store IDs when signed out, and the
 * union of the server wishlist and any not-yet-merged local IDs when signed
 * in (Req 4.4: the count never dips during the sign-in merge window).
 */

// Mock state holders
let mockIsSignedIn = false
let mockServerData: Set<string> | undefined = undefined
let mockServerIsLoading = false
let mockLocalIds: Set<string> = new Set()
let mockLocalCount = 0

vi.mock('@/shared/auth/customerAuthStore', () => ({
    useCustomerAuthStore: () => ({isSignedIn: mockIsSignedIn}),
}))

vi.mock('../hooks/useWishlist', () => ({
    useWishlist: () => ({
        data: mockServerData,
        isLoading: mockServerIsLoading,
    }),
}))

vi.mock('../store/localWishlistStore', () => ({
    useLocalWishlistStore: (selector: (s: unknown) => unknown) => {
        const state = {variantIds: mockLocalIds, count: mockLocalCount}
        return selector(state)
    },
}))

describe('Property 5: Effective wishlist reflects auth state', () => {
    beforeEach(() => {
        mockIsSignedIn = false
        mockServerData = undefined
        mockServerIsLoading = false
        mockLocalIds = new Set()
        mockLocalCount = 0
    })

    it('when signed out, returns local store variant IDs for any arbitrary set of UUIDs', () => {
        fc.assert(
            fc.property(fc.uniqueArray(fc.uuid(), {minLength: 0, maxLength: 20}), (uuids) => {
                // Set up signed-out state
                mockIsSignedIn = false
                mockServerData = new Set(['server-id-should-not-appear'])
                mockServerIsLoading = false

                // Set local store with arbitrary UUIDs
                mockLocalIds = new Set(uuids)
                mockLocalCount = mockLocalIds.size

                // Call the hook
                const result = useEffectiveWishlist()

                // Should return local store's variant IDs
                expect(result.variantIds).toBe(mockLocalIds)
                expect(result.count).toBe(mockLocalIds.size)
                expect(result.isLoading).toBe(false)
            }),
            {numRuns: 100},
        )
    })

    it('when signed in with an empty local store, returns server wishlist variant IDs as-is', () => {
        fc.assert(
            fc.property(fc.uniqueArray(fc.uuid(), {minLength: 0, maxLength: 20}), (uuids) => {
                // Set up signed-in state
                mockIsSignedIn = true
                const serverSet = new Set(uuids)
                mockServerData = serverSet
                mockServerIsLoading = false

                // Local store empty — the steady state outside the merge window
                mockLocalIds = new Set()
                mockLocalCount = 0

                // Call the hook
                const result = useEffectiveWishlist()

                // Should return server wishlist's variant IDs
                expect(result.variantIds).toBe(serverSet)
                expect(result.count).toBe(serverSet.size)
                expect(result.isLoading).toBe(false)
            }),
            {numRuns: 100},
        )
    })

    it('when signed in with un-merged local IDs, returns the server ∪ local union (Req 4.4)', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.uuid(), {minLength: 0, maxLength: 15}),
                fc.uniqueArray(fc.uuid(), {minLength: 1, maxLength: 15}),
                (serverUuids, localUuids) => {
                    // Signed in mid-merge: server data present, local not yet cleared
                    mockIsSignedIn = true
                    mockServerData = new Set(serverUuids)
                    mockServerIsLoading = false
                    mockLocalIds = new Set(localUuids)
                    mockLocalCount = mockLocalIds.size

                    // Call the hook
                    const result = useEffectiveWishlist()

                    // Every server ID and every local ID is present — union semantics
                    for (const id of serverUuids) expect(result.variantIds.has(id)).toBe(true)
                    for (const id of localUuids) expect(result.variantIds.has(id)).toBe(true)
                    const expectedUnion = new Set([...serverUuids, ...localUuids])
                    expect(result.count).toBe(expectedUnion.size)
                    // The count never dips below either source during the merge window
                    expect(result.count).toBeGreaterThanOrEqual(mockServerData.size)
                    expect(result.count).toBeGreaterThanOrEqual(mockLocalIds.size)
                },
            ),
            {numRuns: 100},
        )
    })

    it('when signed in and server data is undefined, still surfaces un-merged local IDs (Req 4.4)', () => {
        fc.assert(
            fc.property(fc.uniqueArray(fc.uuid(), {minLength: 1, maxLength: 10}), (localUuids) => {
                // Set up signed-in state with no server data yet
                mockIsSignedIn = true
                mockServerData = undefined
                mockServerIsLoading = true

                // Local store holds not-yet-merged IDs — they must not vanish while loading
                mockLocalIds = new Set(localUuids)
                mockLocalCount = mockLocalIds.size

                // Call the hook
                const result = useEffectiveWishlist()

                // Union of (empty server) ∪ local = local — no dip while the server loads
                expect(result.variantIds.size).toBe(localUuids.length)
                expect(result.count).toBe(localUuids.length)
                expect(result.isLoading).toBe(true)
            }),
            {numRuns: 100},
        )
    })

    it('switching auth state routes to the correct source for any pair of local/server sets', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.uuid(), {minLength: 0, maxLength: 15}),
                fc.uniqueArray(fc.uuid(), {minLength: 0, maxLength: 15}),
                fc.boolean(),
                (localUuids, serverUuids, isSignedIn) => {
                    // Set up both stores
                    mockLocalIds = new Set(localUuids)
                    mockLocalCount = mockLocalIds.size
                    mockServerData = new Set(serverUuids)
                    mockIsSignedIn = isSignedIn
                    mockServerIsLoading = false

                    // Call the hook
                    const result = useEffectiveWishlist()

                    if (isSignedIn) {
                        // Should return server ∪ local (Req 4.4 union semantics)
                        const expectedUnion = new Set([...serverUuids, ...localUuids])
                        expect(result.variantIds.size).toBe(expectedUnion.size)
                        expect(result.count).toBe(expectedUnion.size)
                        for (const id of expectedUnion) expect(result.variantIds.has(id)).toBe(true)
                    } else {
                        // Should return local data
                        expect(result.variantIds).toBe(mockLocalIds)
                        expect(result.count).toBe(mockLocalIds.size)
                    }
                },
            ),
            {numRuns: 100},
        )
    })
})
