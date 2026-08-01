import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvailabilityFilter } from '../AvailabilityFilter'

describe('AvailabilityFilter', () => {
  it('renders an unchecked checkbox when checked is false', () => {
    render(<AvailabilityFilter checked={false} onChange={vi.fn()} />)

    const checkbox = screen.getByRole('checkbox', { name: /in stock only/i })
    expect(checkbox).not.toBeChecked()
  })

  it('renders a checked checkbox when checked is true', () => {
    render(<AvailabilityFilter checked={true} onChange={vi.fn()} />)

    const checkbox = screen.getByRole('checkbox', { name: /in stock only/i })
    expect(checkbox).toBeChecked()
  })

  it('calls onChange with true when checkbox is checked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AvailabilityFilter checked={false} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox', { name: /in stock only/i }))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when checkbox is unchecked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<AvailabilityFilter checked={true} onChange={onChange} />)

    await user.click(screen.getByRole('checkbox', { name: /in stock only/i }))

    expect(onChange).toHaveBeenCalledWith(false)
  })
})
