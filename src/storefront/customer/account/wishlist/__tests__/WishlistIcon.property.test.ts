// Feature: wishlist-completion, Property 8: Header badge count equals effective wishlist size

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import * as fc from 'fast-check'
import {cleanup, render, screen} from '@testing-library/react'
import {createElement} from 'react'
import {MemoryRouter} from 'react-router-dom'
// Import after mocks
import {WishlistIcon} from '../components/WishlistIcon'

/**
 * Validates: Requirements 4.2
 *
 * Property 8: Header badge count equals effective wishlist size — for any
 * effective wishlist set, the badge count equals the set size; when size is 0,
 * no badge is rendered.
 */

// Mock state holder
let mockCount = 0

vi.mock('../hooks/useEffectiveWishlist', () => ({
    useEffectiveWishlist: () => ({
        variantIds: new Set(),
        count: mockCount,
        isLoading: false,
    }),
}))

function renderWishlistIcon() {
    return render(
        createElement(MemoryRouter, null, createElement(WishlistIcon)),
    )
}

describe('Property 8: Header badge count equals effective wishlist size', () => {
    beforeEach(() => {
        mockCount = 0
    })

    afterEach(() => {
        cleanup()
    })

    it('when count > 0, badge text equals the effective wishlist size', () => {
        fc.assert(
            fc.property(fc.integer({min: 1, max: 999}), (count) => {
                mockCount = count

                const {unmount} = renderWishlistIcon()

                // Badge should display the count as text
                const badge = screen.getByText(String(count))
                expect(badge).toBeDefined()
                expect(badge.textContent).toBe(String(count))

                unmount()
            }),
            {numRuns: 150},
        )
    })

    it('when count is 0, no badge is rendered', () => {
        fc.assert(
            fc.property(fc.constant(0), () => {
                mockCount = 0

                const {container, unmount} = renderWishlistIcon()

                // The badge span should not exist — query for elements with the badge class pattern
                // The badge has specific classes: rounded-full bg-(--sf-accent)
                const badgeElements = container.querySelectorAll('span')
                // When count is 0, there should be no span badge inside the link
                expect(badgeElements.length).toBe(0)

                // Also verify aria-label indicates empty wishlist
                const link = screen.getByRole('link')
                expect(link.getAttribute('aria-label')).toBe('Wishlist')

                unmount()
            }),
            {numRuns: 100},
        )
    })

    it('badge count reflects the effective wishlist set size for any arbitrary size', () => {
        fc.assert(
            fc.property(
                fc.uniqueArray(fc.uuid(), {minLength: 0, maxLength: 50}),
                (uuids) => {
                    const size = uuids.length
                    mockCount = size

                    const {container, unmount} = renderWishlistIcon()

                    if (size === 0) {
                        // No badge span should be rendered
                        const badgeElements = container.querySelectorAll('span')
                        expect(badgeElements.length).toBe(0)
                    } else {
                        // Badge should show the count
                        const badge = screen.getByText(String(size))
                        expect(badge).toBeDefined()
                        expect(badge.textContent).toBe(String(size))
                    }

                    // Verify aria-label contextualises the count
                    const link = screen.getByRole('link')
                    if (size > 0) {
                        expect(link.getAttribute('aria-label')).toBe(
                            `Wishlist with ${size} items`,
                        )
                    } else {
                        expect(link.getAttribute('aria-label')).toBe('Wishlist')
                    }

                    unmount()
                },
            ),
            {numRuns: 150},
        )
    })
})
