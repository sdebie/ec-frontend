import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore.ts'
import { WishlistButton } from '../WishlistButton.tsx'

const mockNavigate = vi.fn()
const mockMutate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../hooks/useWishlist', () => ({
  useWishlist: vi.fn(() => ({ data: new Set<string>() })),
}))

vi.mock('../hooks/useToggleWishlist', () => ({
  useToggleWishlist: vi.fn(() => ({ mutate: mockMutate })),
}))

import { useWishlist } from '../../hooks/useWishlist.ts'
import { useToggleWishlist } from '../../hooks/useToggleWishlist.ts'

const mockedUseWishlist = vi.mocked(useWishlist)
const mockedUseToggleWishlist = vi.mocked(useToggleWishlist)

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
    useCustomerAuthStore.setState({
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
      firstName: null,
      lastName: null,
    })
    mockedUseWishlist.mockReturnValue({ data: new Set<string>() } as ReturnType<typeof useWishlist>)
    mockedUseToggleWishlist.mockReturnValue({ mutate: mockMutate } as unknown as ReturnType<typeof useToggleWishlist>)
  })

  describe('unauthenticated click redirects to login (Req 8.5)', () => {
    it('navigates to /account/login with return URL when not signed in', async () => {
      const user = userEvent.setup()
      renderButton('variant-1', '/products/some-product')

      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))

      expect(mockNavigate).toHaveBeenCalledWith(
        '/account/login?return=%2Fproducts%2Fsome-product',
      )
    })

    it('does not call mutate when not signed in', async () => {
      const user = userEvent.setup()
      renderButton()

      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))

      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('toggling calls correct endpoint (Req 8.2, 8.3)', () => {
    beforeEach(() => {
      useCustomerAuthStore.setState({
        isSignedIn: true,
        token: 'test-token',
        customerType: 'RETAIL',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      })
    })

    it('calls mutate with add: true when item is NOT in wishlist', async () => {
      mockedUseWishlist.mockReturnValue({ data: new Set<string>() } as ReturnType<typeof useWishlist>)

      const user = userEvent.setup()
      renderButton('variant-abc')

      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))

      expect(mockMutate).toHaveBeenCalledWith({ variantId: 'variant-abc', add: true })
    })

    it('calls mutate with add: false when item IS in wishlist', async () => {
      mockedUseWishlist.mockReturnValue({ data: new Set(['variant-abc']) } as ReturnType<typeof useWishlist>)

      const user = userEvent.setup()
      renderButton('variant-abc')

      await user.click(screen.getByRole('button', { name: /remove from wishlist/i }))

      expect(mockMutate).toHaveBeenCalledWith({ variantId: 'variant-abc', add: false })
    })

    it('does not navigate when signed in', async () => {
      const user = userEvent.setup()
      renderButton()

      await user.click(screen.getByRole('button', { name: /add to wishlist/i }))

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('optimistic icon flip (Req 8.2, 8.3)', () => {
    beforeEach(() => {
      useCustomerAuthStore.setState({
        isSignedIn: true,
        token: 'test-token',
        customerType: 'RETAIL',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      })
    })

    it('renders heart with fill="none" when item is NOT in wishlist', () => {
      mockedUseWishlist.mockReturnValue({ data: new Set<string>() } as ReturnType<typeof useWishlist>)
      renderButton('variant-1')

      const button = screen.getByRole('button', { name: /add to wishlist/i })
      const svg = button.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'none')
    })

    it('renders heart with fill="currentColor" when item IS in wishlist', () => {
      mockedUseWishlist.mockReturnValue({ data: new Set(['variant-1']) } as ReturnType<typeof useWishlist>)
      renderButton('variant-1')

      const button = screen.getByRole('button', { name: /remove from wishlist/i })
      const svg = button.querySelector('svg')
      expect(svg).toHaveAttribute('fill', 'currentColor')
    })

    it('sets aria-pressed=false when item is NOT in wishlist', () => {
      mockedUseWishlist.mockReturnValue({ data: new Set<string>() } as ReturnType<typeof useWishlist>)
      renderButton('variant-1')

      expect(screen.getByRole('button', { name: /add to wishlist/i })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })

    it('sets aria-pressed=true when item IS in wishlist', () => {
      mockedUseWishlist.mockReturnValue({ data: new Set(['variant-1']) } as ReturnType<typeof useWishlist>)
      renderButton('variant-1')

      expect(screen.getByRole('button', { name: /remove from wishlist/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('uses aria-label "Add to wishlist" when item is NOT in wishlist', () => {
      mockedUseWishlist.mockReturnValue({ data: new Set<string>() } as ReturnType<typeof useWishlist>)
      renderButton('variant-1')

      expect(screen.getByRole('button', { name: 'Add to wishlist' })).toBeInTheDocument()
    })

    it('uses aria-label "Remove from wishlist" when item IS in wishlist', () => {
      mockedUseWishlist.mockReturnValue({ data: new Set(['variant-1']) } as ReturnType<typeof useWishlist>)
      renderButton('variant-1')

      expect(screen.getByRole('button', { name: 'Remove from wishlist' })).toBeInTheDocument()
    })
  })
})
