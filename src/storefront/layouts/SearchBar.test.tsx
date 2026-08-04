import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SearchBar } from './SearchBar'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderSearchBar(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SearchBar />
    </MemoryRouter>
  )
}

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('submit with value', () => {
    it('navigates to /products?q=<encoded> on form submit', async () => {
      const user = userEvent.setup()
      renderSearchBar()

      const input = screen.getByRole('searchbox', { name: /search products/i })
      await user.type(input, 'red shoes')
      await user.click(screen.getByRole('button', { name: /submit search/i }))

      expect(mockNavigate).toHaveBeenCalledWith('/products?q=red%20shoes')
    })

    it('navigates on Enter key press', async () => {
      const user = userEvent.setup()
      renderSearchBar()

      const input = screen.getByRole('searchbox', { name: /search products/i })
      await user.type(input, 'blue hat{Enter}')

      expect(mockNavigate).toHaveBeenCalledWith('/products?q=blue%20hat')
    })

    it('encodes special characters in the search term', async () => {
      const user = userEvent.setup()
      renderSearchBar()

      const input = screen.getByRole('searchbox', { name: /search products/i })
      await user.type(input, 'shoes & bags{Enter}')

      expect(mockNavigate).toHaveBeenCalledWith('/products?q=shoes%20%26%20bags')
    })

    it('trims whitespace before navigating', async () => {
      const user = userEvent.setup()
      renderSearchBar()

      const input = screen.getByRole('searchbox', { name: /search products/i })
      await user.type(input, '  trimmed  {Enter}')

      expect(mockNavigate).toHaveBeenCalledWith('/products?q=trimmed')
    })
  })

  describe('submit with empty value', () => {
    it('navigates to /products without ?q= when input is empty', async () => {
      const user = userEvent.setup()
      renderSearchBar()

      await user.click(screen.getByRole('button', { name: /submit search/i }))

      expect(mockNavigate).toHaveBeenCalledWith('/products')
    })

    it('navigates to /products when input contains only whitespace', async () => {
      const user = userEvent.setup()
      renderSearchBar()

      const input = screen.getByRole('searchbox', { name: /search products/i })
      await user.type(input, '   {Enter}')

      expect(mockNavigate).toHaveBeenCalledWith('/products')
    })
  })

  /*
    Owner directive 2026-08-04: this box is a DRAFT box, independent of the
    filter sidebar's Search field. It holds only what is being typed now, and
    the applied term is shown in exactly one place — the sidebar, beside the chip
    that removes it.

    These replace an earlier "pre-population from ?q=" suite that asserted the
    opposite. That mirroring is what put the same value in two controls: the box
    stayed populated after a search with no way to clear it from here, and a term
    typed in the sidebar reappeared up here as if the header had been used.
  */
  describe('independence from the applied search', () => {
    it('starts empty even when a search is already applied', () => {
      renderSearchBar(['/products?q=headphones'])

      expect(screen.getByRole('searchbox', { name: /search products/i })).toHaveValue('')
    })

    it('stays empty when the sidebar changes the applied term', () => {
      const { rerender } = renderSearchBar(['/products?q=headphones'])

      // The sidebar publishes a new term; the URL changes underneath this box.
      rerender(
        <MemoryRouter initialEntries={['/products?q=gloves']}>
          <SearchBar />
        </MemoryRouter>
      )

      expect(screen.getByRole('searchbox', { name: /search products/i })).toHaveValue('')
    })

    it('empties itself once the term has been handed to the catalogue', async () => {
      const user = userEvent.setup()
      renderSearchBar()

      const input = screen.getByRole('searchbox', { name: /search products/i })
      await user.type(input, 'headphones{Enter}')

      expect(mockNavigate).toHaveBeenCalledWith('/products?q=headphones')
      expect(input).toHaveValue('')
    })
  })

  describe('no navigation on keystroke', () => {
    it('does not navigate while the user is typing', async () => {
      const user = userEvent.setup()
      renderSearchBar()

      const input = screen.getByRole('searchbox', { name: /search products/i })
      await user.type(input, 'typing')

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  /*
    Clearing the box has to revoke the APPLIED search too. Emptying the input
    alone left the term in the URL, so the results stayed filtered by a search
    the shopper could no longer see and had no way to undo from here.
  */
  describe('clear button', () => {
    it('is absent while the box is empty', () => {
      renderSearchBar(['/products'])

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
    })

    it('appears once the box has a term', () => {
      renderSearchBar(['/products?q=headphones'])

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
    })

    it('empties the input and drops the applied term from the URL', async () => {
      const user = userEvent.setup()
      renderSearchBar(['/products?q=headphones&category=audio'])

      await user.click(screen.getByRole('button', { name: /clear search/i }))

      expect(screen.getByRole('searchbox', { name: /search products/i })).toHaveValue('')
      // Other filters survive: clearing a search narrows nothing else.
      expect(window.location.search).not.toContain('headphones')
    })

    it('empties a typed-but-unapplied term without navigating', async () => {
      const user = userEvent.setup()
      renderSearchBar(['/'])

      const input = screen.getByRole('searchbox', { name: /search products/i })
      await user.type(input, 'draft')
      await user.click(screen.getByRole('button', { name: /clear search/i }))

      expect(input).toHaveValue('')
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('mobile sizing', () => {
    it('renders the input at 16px+ below md so iOS does not zoom the viewport on focus', () => {
      renderSearchBar(['/products'])

      const input = screen.getByRole('searchbox', { name: /search products/i })
      expect(input.className).toContain('text-base')
      expect(input.className).toContain('md:text-sm')
    })
  })
})
