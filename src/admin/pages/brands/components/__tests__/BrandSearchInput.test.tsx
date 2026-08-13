import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrandSearchInput } from '../BrandSearchInput'

describe('BrandSearchInput', () => {
  it('renders the current value in the search box', () => {
    render(<BrandSearchInput value="nike" onChange={vi.fn()} />)

    expect(screen.getByPlaceholderText('Search brands by name...')).toHaveValue('nike')
  })

  it('calls onChange with the new value when typed', () => {
    const onChange = vi.fn()
    render(<BrandSearchInput value="" onChange={onChange} />)

    fireEvent.change(screen.getByPlaceholderText('Search brands by name...'), {
      target: { value: 'adidas' },
    })

    expect(onChange).toHaveBeenCalledWith('adidas')
  })
})
