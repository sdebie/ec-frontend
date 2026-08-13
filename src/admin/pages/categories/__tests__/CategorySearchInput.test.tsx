import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategorySearchInput } from '../components/CategorySearchInput.tsx'

describe('CategorySearchInput', () => {
  it('renders the current value in the search box', () => {
    render(<CategorySearchInput value="electronics" onChange={vi.fn()} />)

    expect(screen.getByPlaceholderText('Search categories by name...')).toHaveValue('electronics')
  })

  it('calls onChange with the new value when typed', () => {
    const onChange = vi.fn()
    render(<CategorySearchInput value="" onChange={onChange} />)

    fireEvent.change(screen.getByPlaceholderText('Search categories by name...'), {
      target: { value: 'laptops' },
    })

    expect(onChange).toHaveBeenCalledWith('laptops')
  })
})
