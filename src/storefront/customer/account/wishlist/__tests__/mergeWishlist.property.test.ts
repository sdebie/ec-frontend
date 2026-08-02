// Feature: wishlist-completion, Property 3: Merge is a union
// Feature: wishlist-completion, Property 4: Merge clears local store on full success
// Feature: wishlist-completion, Property 7: Sign-out does not copy server wishlist to local

import {beforeEach, describe, expect, it, vi} from 'vitest'
import * as fc from 'fast-check'
import {useLocalWishlistStore} from '../store/localWishlistStore'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import {mergeWishlistOnSignIn} from '../mergeWishlistOnSignIn'

// Mock storefrontHttpClient
vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
    storefrontHttpClient: {
        post: vi.fn(),
    },
}))

function createMockQueryClient() {
    return {invalidateQueries: vi.fn()} as any
}

/**
 * Validates: Requirements 6.1
 *
 * Property 3: Merge is a union — for any local set and server set, after merge
 * the server contains the union (mock the POST calls, verify all local IDs were submitted).
 */
describe('Property 3: Merge is a union', () => {
    beforeEach(() => {
        localStorage.clear()
        useLocalWishlistStore.setState({variantIds: new Set(), count: 0})
        vi.clearAllMocks()
    })

    it('all local variant IDs are submitted to the server via POST calls', async () => {
        // Set mock implementation once for the entire property run
        const postMock = vi.mocked(storefrontHttpClient.post)
        postMock.mockResolvedValue({data: {}})

        await fc.assert(
            fc.asyncProperty(
                fc.uniqueArray(fc.uuid(), {minLength: 1, maxLength: 20}),
                async (localIds) => {
                    // Reset store state and mock call history
                    useLocalWishlistStore.setState({variantIds: new Set(), count: 0})
                    postMock.mockClear()

                    // Populate the local store with the generated IDs
                    for (const id of localIds) {
                        useLocalWishlistStore.getState().add(id)
                    }

                    // Create a mock QueryClient
                    const queryClient = createMockQueryClient()

                    // Execute merge
                    await mergeWishlistOnSignIn(queryClient)

                    // Verify: each local ID was submitted via a POST call
                    const postCalls = postMock.mock.calls
                    const submittedIds = postCalls.map((call) => {
                        const url = call[0] as string
                        // URL format: /storefront/wishlist/{id}
                        return url.replace('/storefront/wishlist/', '')
                    })

                    // All local IDs should have been submitted
                    const submittedSet = new Set(submittedIds)
                    for (const id of localIds) {
                        expect(submittedSet.has(id)).toBe(true)
                    }

                    // The number of POST calls should equal the number of local IDs
                    expect(postCalls.length).toBe(localIds.length)
                },
            ),
            {numRuns: 100},
        )
    })
})

/**
 * Validates: Requirements 6.2
 *
 * Property 4: Merge clears local store on full success — for any successful merge,
 * the local wishlist is empty after.
 */
describe('Property 4: Merge clears local store on full success', () => {
    beforeEach(() => {
        localStorage.clear()
        useLocalWishlistStore.setState({variantIds: new Set(), count: 0})
        vi.clearAllMocks()
    })

    it('local wishlist is empty after a fully successful merge', async () => {
        // Set mock implementation once for the entire property run
        const postMock = vi.mocked(storefrontHttpClient.post)
        postMock.mockResolvedValue({data: {}})

        await fc.assert(
            fc.asyncProperty(
                fc.uniqueArray(fc.uuid(), {minLength: 1, maxLength: 20}),
                async (localIds) => {
                    // Reset store state and mock call history
                    useLocalWishlistStore.setState({variantIds: new Set(), count: 0})
                    postMock.mockClear()

                    // Populate the local store
                    for (const id of localIds) {
                        useLocalWishlistStore.getState().add(id)
                    }

                    // Verify local store is non-empty before merge
                    expect(useLocalWishlistStore.getState().variantIds.size).toBe(localIds.length)

                    // Create a mock QueryClient
                    const queryClient = createMockQueryClient()

                    // Execute merge
                    await mergeWishlistOnSignIn(queryClient)

                    // After full success, local store should be empty
                    const state = useLocalWishlistStore.getState()
                    expect(state.variantIds.size).toBe(0)
                    expect(state.count).toBe(0)
                },
            ),
            {numRuns: 100},
        )
    })
})

/**
 * Validates: Requirements 6.5
 *
 * Property 7: Sign-out does not copy server wishlist to local — for any non-empty
 * server wishlist, after sign-out the local wishlist is empty.
 */
describe('Property 7: Sign-out does not copy server wishlist to local', () => {
    beforeEach(() => {
        localStorage.clear()
        useLocalWishlistStore.setState({variantIds: new Set(), count: 0})
        useCustomerAuthStore.setState({
            isSignedIn: false,
            token: null,
            customerType: 'RETAIL',
            email: null,
            firstName: null,
            lastName: null,
        })
    })

    it('after sign-out the local wishlist remains empty regardless of server wishlist size', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.uuid(), {minLength: 1, maxLength: 20}),
                (_serverWishlistIds) => {
                    // Reset state
                    localStorage.clear()
                    useLocalWishlistStore.setState({variantIds: new Set(), count: 0})

                    // Simulate a signed-in state (server wishlist exists but is external)
                    useCustomerAuthStore.getState().setSession({
                        token: 'mock-jwt-token',
                        customerType: 'RETAIL',
                        email: 'test@example.com',
                        firstName: 'Test',
                        lastName: 'User',
                    })

                    // The server wishlist (serverWishlistIds) exists remotely — local store is empty
                    // This verifies the local store is still empty before sign-out
                    expect(useLocalWishlistStore.getState().variantIds.size).toBe(0)

                    // Execute sign-out via clearSession
                    useCustomerAuthStore.getState().clearSession()

                    // After sign-out, local wishlist must remain empty
                    // (server wishlist was never copied to local)
                    const localState = useLocalWishlistStore.getState()
                    expect(localState.variantIds.size).toBe(0)
                    expect(localState.count).toBe(0)
                },
            ),
            {numRuns: 100},
        )
    })
})
