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

  describe('pre-population from ?q= param', () => {
    it('pre-populates input value from ?q= URL param', () => {
      renderSearchBar(['/products?q=headphones'])

      const input = screen.getByRole('searchbox', { name: /search products/i })
      expect(input).toHaveValue('headphones')
    })

    it('shows empty input when ?q= param is absent', () => {
      renderSearchBar(['/products'])

      const input = screen.getByRole('searchbox', { name: /search products/i })
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
})
