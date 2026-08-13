import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrandToolbar } from '../BrandToolbar'

describe('BrandToolbar', () => {
  it('renders the search input with the current value', () => {
    render(
      <BrandToolbar
        searchValue="nike"
        onSearchChange={vi.fn()}
        canMutate={true}
        onCreateBrand={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Search brands by name...')).toHaveValue('nike')
  })

  it('calls onSearchChange when the search box changes', () => {
    const onSearchChange = vi.fn()
    render(
      <BrandToolbar
        searchValue=""
        onSearchChange={onSearchChange}
        canMutate={true}
        onCreateBrand={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('Search brands by name...'), {
      target: { value: 'adidas' },
    })

    expect(onSearchChange).toHaveBeenCalledWith('adidas')
  })

  it('shows the New Brand button and calls onCreateBrand when canMutate is true', () => {
    const onCreateBrand = vi.fn()
    render(
      <BrandToolbar
        searchValue=""
        onSearchChange={vi.fn()}
        canMutate={true}
        onCreateBrand={onCreateBrand}
      />,
    )

    fireEvent.click(screen.getByText('+ New Brand'))

    expect(onCreateBrand).toHaveBeenCalledTimes(1)
  })

  it('hides the New Brand button when canMutate is false', () => {
    render(
      <BrandToolbar
        searchValue=""
        onSearchChange={vi.fn()}
        canMutate={false}
        onCreateBrand={vi.fn()}
      />,
    )

    expect(screen.queryByText('+ New Brand')).not.toBeInTheDocument()
  })
})
