import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BrandPickerSheet } from '../BrandPickerSheet'

const brands = [
  { id: 'b1', name: 'Nike', slug: 'nike' },
  { id: 'b2', name: 'Dromex', slug: 'dromex' },
  { id: 'b3', name: 'Pioneer', slug: 'pioneer' },
]

function renderSheet(overrides: Partial<Parameters<typeof BrandPickerSheet>[0]> = {}) {
  const props = {
    brands,
    activeSlug: '',
    onSelect: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }
  render(<BrandPickerSheet {...props} />)
  return props
}

describe('BrandPickerSheet', () => {
  it('renders as a modal dialog above everything, including floating widgets', () => {
    renderSheet()
    const dialog = screen.getByRole('dialog', { name: 'Brands' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    // z-[100] clears the drawer (z-50) and any chat/support widget
    expect(dialog.className).toContain('z-[100]')
  })

  it('lists All Brands plus every brand with 48px+ tap targets', () => {
    renderSheet()
    expect(screen.getByRole('button', { name: 'All Brands' })).toBeInTheDocument()
    for (const brand of brands) {
      const row = screen.getByRole('button', { name: brand.name })
      expect(row.className).toContain('min-h-12')
    }
  })

  it('marks the selected brand with a checkmark, not colour alone', () => {
    renderSheet({ activeSlug: 'dromex' })
    const selected = screen.getByRole('button', { name: 'Dromex' })
    expect(selected).toHaveAttribute('aria-pressed', 'true')
    expect(selected.querySelector('svg')).not.toBeNull()
    // Unselected rows carry no checkmark
    expect(screen.getByRole('button', { name: 'Nike' }).querySelector('svg')).toBeNull()
  })

  it('search filters the list case-insensitively and hides All Brands while searching', async () => {
    const user = userEvent.setup()
    renderSheet()

    await user.type(screen.getByLabelText('Search brands'), 'dro')
    expect(screen.getByRole('button', { name: 'Dromex' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Nike' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'All Brands' })).not.toBeInTheDocument()
  })

  it('shows an empty state when no brand matches', async () => {
    const user = userEvent.setup()
    renderSheet()
    await user.type(screen.getByLabelText('Search brands'), 'zzz')
    expect(screen.getByText('No brands match your search.')).toBeInTheDocument()
  })

  it('selecting a brand live-applies via onSelect without closing the sheet', async () => {
    const user = userEvent.setup()
    const props = renderSheet()

    await user.click(screen.getByRole('button', { name: 'Pioneer' }))
    expect(props.onSelect).toHaveBeenCalledWith('pioneer')
    expect(props.onClose).not.toHaveBeenCalled()
  })

  it('Show results, the back control, the X, and Escape all close the sheet', async () => {
    const user = userEvent.setup()
    const props = renderSheet()

    await user.click(screen.getByRole('button', { name: 'Show results' }))
    await user.click(screen.getByRole('button', { name: 'Brands' }))
    await user.click(screen.getByRole('button', { name: 'Close brand picker' }))
    await user.keyboard('{Escape}')
    expect(props.onClose).toHaveBeenCalledTimes(4)
  })
})
