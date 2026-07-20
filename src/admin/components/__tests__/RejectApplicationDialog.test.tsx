import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { RejectApplicationDialog } from '../RejectApplicationDialog'

describe('RejectApplicationDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dialog when open=true', () => {
    render(
      <RejectApplicationDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByText('Reject Wholesale Application'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Reason'),
    ).toBeInTheDocument()
  })

  it('does not render the dialog when open=false', () => {
    render(
      <RejectApplicationDialog
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows inline error and does NOT call onConfirm when reason is empty string', () => {
    render(
      <RejectApplicationDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    )

    // Click Reject without entering a reason
    const rejectButton = screen.getByRole('button', { name: 'Reject' })
    fireEvent.click(rejectButton)

    // Inline error shown
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByText('A rejection reason is required.'),
    ).toBeInTheDocument()

    // onConfirm was NOT called
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('shows inline error and does NOT call onConfirm when reason is whitespace-only', () => {
    render(
      <RejectApplicationDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    )

    const textarea = screen.getByLabelText('Reason')
    fireEvent.change(textarea, { target: { value: '   ' } })

    const rejectButton = screen.getByRole('button', { name: 'Reject' })
    fireEvent.click(rejectButton)

    // Inline error shown
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByText('A rejection reason is required.'),
    ).toBeInTheDocument()

    // onConfirm was NOT called
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm with trimmed value when a valid reason is provided', () => {
    render(
      <RejectApplicationDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    )

    const textarea = screen.getByLabelText('Reason')
    fireEvent.change(textarea, {
      target: { value: '  Incomplete documentation.  ' },
    })

    const rejectButton = screen.getByRole('button', { name: 'Reject' })
    fireEvent.click(rejectButton)

    // No error shown
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    // onConfirm called with the trimmed reason
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    expect(mockOnConfirm).toHaveBeenCalledWith('Incomplete documentation.')
  })

  it('clears state when dialog is reopened', () => {
    const { rerender } = render(
      <RejectApplicationDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    )

    // Type something and trigger an error
    const textarea = screen.getByLabelText('Reason')
    fireEvent.change(textarea, { target: { value: 'Some reason' } })

    // Close the dialog
    rerender(
      <RejectApplicationDialog
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    )

    // Reopen the dialog
    rerender(
      <RejectApplicationDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />,
    )

    // State should be cleared — textarea should be empty
    const newTextarea = screen.getByLabelText('Reason')
    expect(newTextarea).toHaveValue('')

    // No error should be displayed
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
