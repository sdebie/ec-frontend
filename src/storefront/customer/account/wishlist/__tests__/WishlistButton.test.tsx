import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { WishlistButton } from '../WishlistButton.tsx'

const mockToggle = vi.fn()

vi.mock('../useEffectiveWishlist', () => ({
  useEffectiveWishlist: vi.fn(() => ({ variantIds: new Set<string>(), count: 0, isLoading: false })),
}))

vi.mock('../useToggleEffective', () => ({
  useToggleEffective: vi.fn(() => ({ toggle: mockToggle, isPending: false })),
}))

import { useEffectiveWishlist } from '../useEffectiveWishlist'
import { useToggleEffective } from '../useToggleEffective'

const mockedUseEffectiveWishlist = vi.mocked(useEffectiveWishlist)
const mockedUseToggleEffective = vi.mocked(useToggleEffective)

function renderButton(variantId = 'variant-1', initialPath = '/products/some-product') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <WishlistButton variantId={variantId} />
    </MemoryRouter>,
  )
}

describe('WishlistButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set<string>(), count: 0, isLoading: false })
    mockedUseToggleEffective.mockReturnValue({ toggle: mockToggle, isPending: false })
  })

  describe('signed-out toggle adds to local wishlist (Req 1.3)', () => {
    it('calls toggle with add: true when item is NOT in wishlist (works signed out)', async () => {
      const user = userEvent.setup()
      renderButton('variant-abc')

      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))

      expect(mockToggle).toHaveBeenCalledWith('variant-abc', true)
    })

    it('calls toggle with add: false when item IS in wishlist (works signed out)', async () => {
      mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set(['variant-abc']), count: 1, isLoading: false })

      const user = userEvent.setup()
      renderButton('variant-abc')

      await user.click(screen.getByRole('button', { name: /remove from wishlist/i }))

      expect(mockToggle).toHaveBeenCalledWith('variant-abc', false)
    })
  })

  describe('toggling calls correct endpoint (Req 1.4)', () => {
    it('calls toggle with add: true when item is NOT in wishlist', async () => {
      const user = userEvent.setup()
      renderButton('variant-abc')

      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))

      expect(mockToggle).toHaveBeenCalledWith('variant-abc', true)
    })

    it('calls toggle with add: false when item IS in wishlist', async () => {
      mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set(['variant-abc']), count: 1, isLoading: false })

      const user = userEvent.setup()
      renderButton('variant-abc')

      await user.click(screen.getByRole('button', { name: /remove from wishlist/i }))

      expect(mockToggle).toHaveBeenCalledWith('variant-abc', false)
    })
  })

  describe('optimistic icon flip (Req 1.2, 7.1)', () => {
    it('renders heart with fill="none" when item is NOT in wishlist', () => {
      renderButton('variant-1')

      const button = screen.getByRole('button', { name: /add to wishlist/i })
      const svg = button.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'none')
    })

    it('renders heart with fill="currentColor" when item IS in wishlist', () => {
      mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set(['variant-1']), count: 1, isLoading: false })
      renderButton('variant-1')

      const button = screen.getByRole('button', { name: /remove from wishlist/i })
      const svg = button.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'currentColor')
    })

    it('sets aria-pressed=false when item is NOT in wishlist', () => {
      renderButton('variant-1')

      expect(screen.getByRole('button', { name: /add to wishlist/i })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })

    it('sets aria-pressed=true when item IS in wishlist', () => {
      mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set(['variant-1']), count: 1, isLoading: false })
      renderButton('variant-1')

      expect(screen.getByRole('button', { name: /remove from wishlist/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('uses aria-label "Add to wishlist" when item is NOT in wishlist', () => {
      renderButton('variant-1')

      expect(screen.getByRole('button', { name: 'Add to wishlist' })).toBeInTheDocument()
    })

    it('uses aria-label "Remove from wishlist" when item IS in wishlist', () => {
      mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set(['variant-1']), count: 1, isLoading: false })
      renderButton('variant-1')

      expect(screen.getByRole('button', { name: 'Remove from wishlist' })).toBeInTheDocument()
    })
  })

  describe('stopPropagation (Req 2.2)', () => {
    it('stops event propagation on click', async () => {
      const parentClick = vi.fn()
      render(
        <MemoryRouter>
          <div onClick={parentClick}>
            <WishlistButton variantId="variant-1" />
          </div>
        </MemoryRouter>,
      )

      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))

      expect(parentClick).not.toHaveBeenCalled()
    })
  })
})
