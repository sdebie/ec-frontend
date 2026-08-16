import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ToggleGroup } from './ToggleGroup'

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
]

describe('ToggleGroup', () => {
  it('renders every option and marks the active one pressed', () => {
    render(<ToggleGroup options={OPTIONS} value="a" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Option A' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Option B' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('fires onChange with the clicked option value', () => {
    const onChange = vi.fn()
    render(<ToggleGroup options={OPTIONS} value="a" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Option B' }))

    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('does not fire onChange for a disabled option', () => {
    const onChange = vi.fn()
    render(
      <ToggleGroup
        options={[OPTIONS[0], { ...OPTIONS[1], disabled: true }]}
        value="a"
        onChange={onChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Option B' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not fire onChange for any option when the whole group is disabled', () => {
    const onChange = vi.fn()
    render(<ToggleGroup options={OPTIONS} value="a" onChange={onChange} disabled />)

    fireEvent.click(screen.getByRole('button', { name: 'Option B' }))

    expect(onChange).not.toHaveBeenCalled()
  })
})
