import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, cleanup, within, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as fc from 'fast-check'
import { SearchBar } from './SearchBar'

/**
 * **Validates: Requirements 3.3, 3.5**
 *
 * Property 1: Search param round-trip preservation
 * For any non-empty search term submitted via the SearchBar, navigating to
 * `/products?q=<encoded term>` and reading back the `?q=` param SHALL yield
 * the original search term after URL decoding.
 */

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderSearchBar() {
  return render(
    <MemoryRouter>
      <SearchBar />
    </MemoryRouter>
  )
}

describe('SearchBar — Property: search param round-trip preservation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('for any non-empty trimmed string, encodeURIComponent round-trips through decodeURIComponent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (term) => {
          const trimmed = term.trim()
          const encoded = encodeURIComponent(trimmed)
          const decoded = decodeURIComponent(encoded)
          expect(decoded).toBe(trimmed)
        }
      ),
      { numRuns: 200 }
    )
  })

  it('for any non-empty trimmed string submitted, navigate is called with a URL that preserves the original term after decoding', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (term) => {
          mockNavigate.mockClear()
          cleanup()

          const { unmount } = renderSearchBar()
          const form = document.querySelector('form[role="search"]')!
          const container = within(form as HTMLElement)

          const input = container.getByRole('searchbox', { name: /search products/i })

          // Use fireEvent.change to set value directly — avoids userEvent keyboard
          // parsing issues with special characters like { [ which are not relevant
          // to the property being tested (URL encoding round-trip)
          fireEvent.change(input, { target: { value: term } })
          fireEvent.submit(form)

          expect(mockNavigate).toHaveBeenCalledTimes(1)
          const navigatedPath = mockNavigate.mock.calls[0][0] as string
          const url = new URL(navigatedPath, 'http://localhost')
          const qParam = url.searchParams.get('q')

          // The param value should equal the trimmed input after URL decoding
          expect(qParam).toBe(term.trim())

          unmount()
        }
      ),
      { numRuns: 200 }
    )
  })
})
