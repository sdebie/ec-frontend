import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CustomerLoginModal } from '../CustomerLoginModal'

vi.mock('../CustomerLoginForm', () => ({
  CustomerLoginForm: ({
    onSuccess,
    onForgotPassword,
  }: {
    onSuccess?: () => void
    onForgotPassword?: () => void
  }) => (
    <div>
      <button onClick={onSuccess}>mock sign in</button>
      <button onClick={onForgotPassword}>mock forgot password</button>
    </div>
  ),
}))

describe('CustomerLoginModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <CustomerLoginModal isOpen={false} onClose={vi.fn()} onForgotPassword={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('portals into document.body rather than the caller subtree', () => {
    const { container } = render(
      <div data-testid="host">
        <CustomerLoginModal isOpen onClose={vi.fn()} onForgotPassword={vi.fn()} />
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
        <CustomerLoginModal isOpen onClose={vi.fn()} onForgotPassword={vi.fn()} />
      </div>
    )

    expect(container.querySelector('span[hidden]')).not.toBeNull()
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<CustomerLoginModal isOpen onClose={onClose} onForgotPassword={vi.fn()} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<CustomerLoginModal isOpen onClose={onClose} onForgotPassword={vi.fn()} />)
    fireEvent.click(document.querySelector('[aria-hidden="true"]')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    render(<CustomerLoginModal isOpen onClose={onClose} onForgotPassword={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('forwards onForgotPassword from the form', () => {
    const onForgotPassword = vi.fn()
    render(<CustomerLoginModal isOpen onClose={vi.fn()} onForgotPassword={onForgotPassword} />)
    fireEvent.click(screen.getByText('mock forgot password'))
    expect(onForgotPassword).toHaveBeenCalledTimes(1)
  })

  it('renders the login form', () => {
    render(<CustomerLoginModal isOpen onClose={vi.fn()} onForgotPassword={vi.fn()} />)
    expect(screen.getByText('mock sign in')).toBeInTheDocument()
  })
})
