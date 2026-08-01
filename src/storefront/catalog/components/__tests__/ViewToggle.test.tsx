import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewToggle } from '../ViewToggle'
import { describe, expect, it, vi } from 'vitest'

describe('ViewToggle', () => {
  it('renders grid and list buttons with accessible labels', () => {
    render(<ViewToggle view="grid" onViewChange={() => {}} />)
    expect(screen.getByLabelText('Grid view')).toBeInTheDocument()
    expect(screen.getByLabelText('List view')).toBeInTheDocument()
  })

  it('marks the grid button as pressed when view is grid', () => {
    render(<ViewToggle view="grid" onViewChange={() => {}} />)
    expect(screen.getByLabelText('Grid view')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('List view')).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks the list button as pressed when view is list', () => {
    render(<ViewToggle view="list" onViewChange={() => {}} />)
    expect(screen.getByLabelText('Grid view')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByLabelText('List view')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onViewChange with "list" when list button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle view="grid" onViewChange={onChange} />)

    await user.click(screen.getByLabelText('List view'))
    expect(onChange).toHaveBeenCalledWith('list')
  })

  it('calls onViewChange with "grid" when grid button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ViewToggle view="list" onViewChange={onChange} />)

    await user.click(screen.getByLabelText('Grid view'))
    expect(onChange).toHaveBeenCalledWith('grid')
  })

  it('both buttons are keyboard-accessible', () => {
    render(<ViewToggle view="grid" onViewChange={() => {}} />)
    const gridBtn = screen.getByLabelText('Grid view')
    const listBtn = screen.getByLabelText('List view')
    // Buttons are inherently keyboard accessible (focusable + activatable)
    expect(gridBtn.tagName).toBe('BUTTON')
    expect(listBtn.tagName).toBe('BUTTON')
  })
})
