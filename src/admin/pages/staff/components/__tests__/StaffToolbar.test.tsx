import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { StaffToolbar } from '../StaffToolbar'

describe('StaffToolbar', () => {
  it('renders the search input with the current value', () => {
    render(
      <StaffToolbar
        searchValue="jane"
        onSearchChange={vi.fn()}
        canMutate={true}
        onAddStaff={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Search by name or email...')).toHaveValue('jane')
  })

  it('calls onSearchChange when the search box changes', () => {
    const onSearchChange = vi.fn()
    render(
      <StaffToolbar
        searchValue=""
        onSearchChange={onSearchChange}
        canMutate={true}
        onAddStaff={vi.fn()}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('Search by name or email...'), {
      target: { value: 'jane' },
    })

    expect(onSearchChange).toHaveBeenCalledWith('jane')
  })

  it('shows the Add staff member button and calls onAddStaff when canMutate is true', () => {
    const onAddStaff = vi.fn()
    render(
      <StaffToolbar
        searchValue=""
        onSearchChange={vi.fn()}
        canMutate={true}
        onAddStaff={onAddStaff}
      />,
    )

    fireEvent.click(screen.getByText('Add staff member'))

    expect(onAddStaff).toHaveBeenCalledTimes(1)
  })

  it('hides the Add staff member button when canMutate is false', () => {
    render(
      <StaffToolbar
        searchValue=""
        onSearchChange={vi.fn()}
        canMutate={false}
        onAddStaff={vi.fn()}
      />,
    )

    expect(screen.queryByText('Add staff member')).not.toBeInTheDocument()
  })
})
