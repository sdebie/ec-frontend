import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ToastContainer } from '../ToastContainer'
import { useToastStore, toast } from '../toastStore'

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset store between tests
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders toasts from the store in a fixed overlay', () => {
    useToastStore.getState().add({
      variant: 'success',
      message: 'Item saved',
      duration: 4000,
    })

    render(<ToastContainer />)

    expect(screen.getByText('Item saved')).toBeInTheDocument()
  })

  it('renders in a fixed overlay with pointer-events-none', () => {
    render(<ToastContainer />)

    const container = screen.getByLabelText('Notifications')
    expect(container).toHaveClass('fixed')
    expect(container).toHaveClass('pointer-events-none')
  })

  it('renders toast with title and message', () => {
    useToastStore.getState().add({
      variant: 'error',
      title: 'Error occurred',
      message: 'Something went wrong',
      duration: 0,
    })

    render(<ToastContainer />)

    expect(screen.getByText('Error occurred')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('auto-dismisses toasts with duration > 0', () => {
    toast.success('Auto dismiss me')

    render(<ToastContainer />)

    expect(screen.getByText('Auto dismiss me')).toBeInTheDocument()

    // Advance past the success duration (4000ms) + exit animation (300ms)
    act(() => {
      vi.advanceTimersByTime(4300)
    })

    expect(screen.queryByText('Auto dismiss me')).not.toBeInTheDocument()
  })

  it('does NOT auto-dismiss toasts with duration === 0 (errors)', () => {
    toast.error('Persistent error')

    render(<ToastContainer />)

    expect(screen.getByText('Persistent error')).toBeInTheDocument()

    // Advance well beyond normal dismiss time
    act(() => {
      vi.advanceTimersByTime(60000)
    })

    // Error toast should still be there
    expect(screen.getByText('Persistent error')).toBeInTheDocument()
  })

  it('removes toast when close button is clicked', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()

    useToastStore.getState().add({
      variant: 'info',
      message: 'Closeable toast',
      duration: 0, // persistent so it doesn't auto-dismiss
    })

    render(<ToastContainer />)

    expect(screen.getByText('Closeable toast')).toBeInTheDocument()

    const dismissButton = screen.getByLabelText('Dismiss notification')
    await user.click(dismissButton)

    // Wait for exit animation (300ms)
    await vi.waitFor(() => {
      expect(screen.queryByText('Closeable toast')).not.toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('renders multiple toasts', () => {
    useToastStore.getState().add({
      variant: 'success',
      message: 'First toast',
      duration: 4000,
    })
    useToastStore.getState().add({
      variant: 'warning',
      message: 'Second toast',
      duration: 6000,
    })

    render(<ToastContainer />)

    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('Second toast')).toBeInTheDocument()
  })

  it('uses z-[9999] to stay above other content', () => {
    render(<ToastContainer />)

    const container = screen.getByLabelText('Notifications')
    expect(container).toHaveClass('z-[9999]')
  })
})
