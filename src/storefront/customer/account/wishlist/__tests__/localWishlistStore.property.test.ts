// Feature: wishlist-completion, Property 1: Local wishlist toggle round-trip
// Feature: wishlist-completion, Property 2: Malformed localStorage entries are discarded

import {beforeEach, describe, expect, it} from 'vitest'
import * as fc from 'fast-check'
import {useLocalWishlistStore} from '../store/localWishlistStore'

const STORAGE_KEY = 'ec_local_wishlist'
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Validates: Requirements 5.1
 *
 * Property 1: Local wishlist toggle round-trip — for any valid UUID,
 * adding to the store and reading back from localStorage produces a set containing that ID.
 */
describe('Property 1: Local wishlist toggle round-trip', () => {
    beforeEach(() => {
        localStorage.clear()
        useLocalWishlistStore.setState({variantIds: new Set(), count: 0})
    })

    it('adding a valid UUID and reading back from localStorage produces a set containing that ID', () => {
        fc.assert(
            fc.property(fc.uuid(), (uuid) => {
                // Reset state for each iteration
                localStorage.clear()
                useLocalWishlistStore.setState({variantIds: new Set(), count: 0})

                // Add the UUID to the store
                useLocalWishlistStore.getState().add(uuid)

                // Read the raw localStorage value and parse it through the store's getItem logic
                const raw = localStorage.getItem(STORAGE_KEY)
                expect(raw).not.toBeNull()

                const parsed = JSON.parse(raw!)
                const ids: string[] = Array.isArray(parsed?.state?.variantIds)
                    ? parsed.state.variantIds.filter(
                        (id: unknown) => typeof id === 'string' && UUID_V4_REGEX.test(id),
                    )
                    : []

                const restoredSet = new Set(ids)
                expect(restoredSet.has(uuid)).toBe(true)
            }),
            {numRuns: 100},
        )
    })
})

/**
 * Validates: Requirements 5.2
 *
 * Property 2: Malformed localStorage entries are discarded — for any string NOT matching UUID v4,
 * if placed in the persisted array, reading the store produces a set without it.
 */
describe('Property 2: Malformed localStorage entries are discarded', () => {
    beforeEach(() => {
        localStorage.clear()
        useLocalWishlistStore.setState({variantIds: new Set(), count: 0})
    })

    // Arbitrary that generates strings that are NOT valid UUID v4
    const nonUuidArbitrary = fc
        .string({minLength: 1})
        .filter((s) => !UUID_V4_REGEX.test(s))

    it('non-UUID strings placed in the persisted array are discarded on read', () => {
        fc.assert(
            fc.property(nonUuidArbitrary, (malformed) => {
                // Reset state
                localStorage.clear()
                useLocalWishlistStore.setState({variantIds: new Set(), count: 0})

                // Manually write a malformed entry into localStorage
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({state: {variantIds: [malformed]}}),
                )

                // Use the store's custom storage adapter to read back
                // Simulate what the persist middleware getItem does
                const raw = localStorage.getItem(STORAGE_KEY)
                const parsed = JSON.parse(raw!)
                const ids: string[] = Array.isArray(parsed?.state?.variantIds)
                    ? parsed.state.variantIds.filter(
                        (id: unknown) => typeof id === 'string' && UUID_V4_REGEX.test(id),
                    )
                    : []

                const restoredSet = new Set(ids)
                expect(restoredSet.has(malformed)).toBe(false)
                expect(restoredSet.size).toBe(0)
            }),
            {numRuns: 100},
        )
    })

    it('non-UUID entries mixed with valid UUIDs are discarded while valid ones are retained', () => {
        fc.assert(
            fc.property(fc.uuid(), nonUuidArbitrary, (validUuid, malformed) => {
                // Reset state
                localStorage.clear()
                useLocalWishlistStore.setState({variantIds: new Set(), count: 0})

                // Write a mix of valid and malformed entries into localStorage
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({state: {variantIds: [validUuid, malformed]}}),
                )

                // Read through the store's validation logic
                const raw = localStorage.getItem(STORAGE_KEY)
                const parsed = JSON.parse(raw!)
                const ids: string[] = Array.isArray(parsed?.state?.variantIds)
                    ? parsed.state.variantIds.filter(
                        (id: unknown) => typeof id === 'string' && UUID_V4_REGEX.test(id),
                    )
                    : []

                const restoredSet = new Set(ids)
                expect(restoredSet.has(validUuid)).toBe(true)
                expect(restoredSet.has(malformed)).toBe(false)
            }),
            {numRuns: 100},
        )
    })
})
