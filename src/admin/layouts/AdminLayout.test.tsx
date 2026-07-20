import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AdminLayout } from './AdminLayout'

vi.mock('./AdminHeader', () => ({
  AdminHeader: ({ onMenuClick }: { onMenuClick: () => void }) => (
    <div data-testid="admin-header">
      <button onClick={onMenuClick} data-testid="burger-button">Menu</button>
    </div>
  ),
}))

vi.mock('./AdminSidebar', () => ({
  AdminSidebar: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="admin-sidebar" data-open={isOpen}>
      <button onClick={onClose} data-testid="close-sidebar">Close</button>
    </div>
  ),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, Outlet: () => <div data-testid="outlet" /> }
})

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders AdminHeader, AdminSidebar, and Outlet (Req 1.1)', () => {
    render(<AdminLayout />)

    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('toggles sidebar open state when burger is clicked (Req 1.2)', () => {
    render(<AdminLayout />)

    expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'false')

    fireEvent.click(screen.getByTestId('burger-button'))
    expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'true')

    fireEvent.click(screen.getByTestId('burger-button'))
    expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'false')
  })

  it('debounce prevents double-close flicker (Req 1.2)', () => {
    render(<AdminLayout />)

    // Open the sidebar
    fireEvent.click(screen.getByTestId('burger-button'))
    expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'true')

    // First close triggers the debounce guard
    fireEvent.click(screen.getByTestId('close-sidebar'))
    expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'false')

    // Re-open via burger toggle
    fireEvent.click(screen.getByTestId('burger-button'))
    expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'true')

    // Within 50ms window, second close is ignored because closingRef is still true
    fireEvent.click(screen.getByTestId('close-sidebar'))
    expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'true')

    // After 50ms, the guard resets and close works again
    act(() => { vi.advanceTimersByTime(50) })

    fireEvent.click(screen.getByTestId('close-sidebar'))
    expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'false')
  })
})
