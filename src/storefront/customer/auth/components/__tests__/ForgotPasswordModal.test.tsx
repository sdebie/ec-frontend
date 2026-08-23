import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ForgotPasswordModal } from '../ForgotPasswordModal'

vi.mock('../ForgotPasswordForm', () => ({
  ForgotPasswordForm: ({ onBackToLogin }: { onBackToLogin?: () => void }) => (
    <div>
      <button onClick={onBackToLogin}>mock back to login</button>
    </div>
  ),
}))

describe('ForgotPasswordModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ForgotPasswordModal isOpen={false} onClose={vi.fn()} onBackToLogin={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('portals into document.body rather than the caller subtree', () => {
    const { container } = render(
      <div data-testid="host">
        <ForgotPasswordModal isOpen onClose={vi.fn()} onBackToLogin={vi.fn()} />
      </div>
    )

    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('leaves only a hidden anchor at the call site, which cannot take space-y margins', () => {
    // REGRESSION: the original defect — no portal at all — meant a `space-y-*`
    // ancestor could apply margin to the fixed overlay and shrink it below the
    // viewport. Proving the call site is left with only a [hidden] anchor is
    // proof that can't happen anymore.
    const { container } = render(
      <div className="space-y-6">
        <ForgotPasswordModal isOpen onClose={vi.fn()} onBackToLogin={vi.fn()} />
      </div>
    )

    expect(container.querySelector('span[hidden]')).not.toBeNull()
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<ForgotPasswordModal isOpen onClose={onClose} onBackToLogin={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<ForgotPasswordModal isOpen onClose={onClose} onBackToLogin={vi.fn()} />)
    fireEvent.click(document.querySelector('[aria-hidden="true"]')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<ForgotPasswordModal isOpen onClose={onClose} onBackToLogin={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('forwards onBackToLogin from the form', () => {
    const onBackToLogin = vi.fn()
    render(<ForgotPasswordModal isOpen onClose={vi.fn()} onBackToLogin={onBackToLogin} />)
    fireEvent.click(screen.getByText('mock back to login'))
    expect(onBackToLogin).toHaveBeenCalledTimes(1)
  })
})
