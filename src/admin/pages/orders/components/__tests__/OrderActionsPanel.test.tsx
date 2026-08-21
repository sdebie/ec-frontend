import {describe, expect, it, vi} from 'vitest'
import {render, screen, fireEvent} from '@testing-library/react'
import {OrderActionsPanel} from '../OrderActionsPanel'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import {TRANSITION_META} from '../../utils/transitionMetadata'

vi.mock('../../utils/getAvailableTransitions', () => ({
  getAvailableTransitions: vi.fn(),
}))

import {getAvailableTransitions} from '../../utils/getAvailableTransitions'

const mockedGetAvailableTransitions = vi.mocked(getAvailableTransitions)

const noop = () => {}

describe('OrderActionsPanel', () => {
  it('renders inside a bordered/panel Card with an "Order Actions" heading', () => {
    mockedGetAvailableTransitions.mockReturnValue([OrderStatus.PROCESSING])

    render(
      <OrderActionsPanel
        status={OrderStatus.PAID}
        onMove={noop}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    const heading = screen.getByText('Order Actions')
    expect(heading).toBeInTheDocument()
    // The heading must live inside a real Card — not just floating text — so the panel
    // actually has the bordered/background container the spec requires.
    expect(heading.closest('[class*="rounded-"]')).not.toBeNull()
  })

  it('returns null when getAvailableTransitions returns empty', () => {
    mockedGetAvailableTransitions.mockReturnValue([])

    const {container} = render(
      <OrderActionsPanel
        status={OrderStatus.REFUNDED}
        onMove={noop}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    expect(container.innerHTML).toBe('')
  })

  it('renders primary button as the first available transition', () => {
    mockedGetAvailableTransitions.mockReturnValue([
      OrderStatus.PROCESSING,
      OrderStatus.USER_CANCELED,
      OrderStatus.ADMIN_CANCELED,
    ])

    render(
      <OrderActionsPanel
        status={OrderStatus.PAID}
        onMove={noop}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    const processingMeta = TRANSITION_META.find((m) => m.target === OrderStatus.PROCESSING)!
    const primaryButton = screen.getByRole('button', {name: processingMeta.label})
    expect(primaryButton).toBeInTheDocument()
  })

  it('renders dropdown with remaining transitions when more than one is available', () => {
    mockedGetAvailableTransitions.mockReturnValue([
      OrderStatus.PROCESSING,
      OrderStatus.USER_CANCELED,
      OrderStatus.ADMIN_CANCELED,
    ])

    const {container} = render(
      <OrderActionsPanel
        status={OrderStatus.PAID}
        onMove={noop}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    // The "More actions" trigger should be rendered
    expect(screen.getByText('More actions')).toBeInTheDocument()

    // Open the dropdown
    const triggerButton = container.querySelector('button[type="button"]:last-of-type')!
    fireEvent.click(triggerButton)

    // Dropdown menu items should be visible
    const menuItems = document.body.querySelectorAll('[role="menuitem"]')
    const cancelCustomerMeta = TRANSITION_META.find((m) => m.target === OrderStatus.USER_CANCELED)!
    const cancelStaffMeta = TRANSITION_META.find((m) => m.target === OrderStatus.ADMIN_CANCELED)!

    const labels = Array.from(menuItems).map((item) => item.textContent)
    expect(labels).toContain(cancelCustomerMeta.label)
    expect(labels).toContain(cancelStaffMeta.label)
  })

  it('does not render dropdown when only one transition is available', () => {
    mockedGetAvailableTransitions.mockReturnValue([OrderStatus.REFUNDED])

    render(
      <OrderActionsPanel
        status={OrderStatus.PARTIALLY_REFUNDED}
        onMove={noop}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    expect(screen.queryByText('More actions')).not.toBeInTheDocument()
  })

  it('applies destructive styling to destructive transitions in the dropdown', () => {
    mockedGetAvailableTransitions.mockReturnValue([
      OrderStatus.PROCESSING,
      OrderStatus.USER_CANCELED,
      OrderStatus.ADMIN_CANCELED,
    ])

    const {container} = render(
      <OrderActionsPanel
        status={OrderStatus.PAID}
        onMove={noop}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    // Open the dropdown
    const triggerButton = container.querySelector('button[type="button"]:last-of-type')!
    fireEvent.click(triggerButton)

    const menuItems = document.body.querySelectorAll('[role="menuitem"]')
    // Both cancel items are destructive — they should have the error color class
    for (const item of menuItems) {
      expect(item.className).toContain('text-(--c-error)')
    }
  })

  it('calls onMove for direct transitions (no prompt)', () => {
    mockedGetAvailableTransitions.mockReturnValue([OrderStatus.PROCESSING])

    const onMove = vi.fn()
    render(
      <OrderActionsPanel
        status={OrderStatus.PAID}
        onMove={onMove}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    const processingMeta = TRANSITION_META.find((m) => m.target === OrderStatus.PROCESSING)!
    fireEvent.click(screen.getByRole('button', {name: processingMeta.label}))

    expect(onMove).toHaveBeenCalledWith(OrderStatus.PROCESSING)
  })

  it('calls onConfirm for transitions with a prompt (non-ship)', () => {
    mockedGetAvailableTransitions.mockReturnValue([OrderStatus.USER_CANCELED])

    const onConfirm = vi.fn()
    render(
      <OrderActionsPanel
        status={OrderStatus.PAID}
        onMove={noop}
        onConfirm={onConfirm}
        onShip={noop}
      />,
    )

    const cancelMeta = TRANSITION_META.find((m) => m.target === OrderStatus.USER_CANCELED)!
    fireEvent.click(screen.getByRole('button', {name: cancelMeta.label}))

    expect(onConfirm).toHaveBeenCalledWith('cancel-customer')
  })

  it('calls onShip for the ship transition', () => {
    mockedGetAvailableTransitions.mockReturnValue([OrderStatus.IN_TRANSIT])

    const onShip = vi.fn()
    render(
      <OrderActionsPanel
        status={OrderStatus.READY_TO_SHIP}
        onMove={noop}
        onConfirm={noop}
        onShip={onShip}
      />,
    )

    const shipMeta = TRANSITION_META.find((m) => m.target === OrderStatus.IN_TRANSIT)!
    fireEvent.click(screen.getByRole('button', {name: shipMeta.label}))

    expect(onShip).toHaveBeenCalled()
  })

  it('calls onConfirm via dropdown item for prompted transitions in the menu', () => {
    mockedGetAvailableTransitions.mockReturnValue([
      OrderStatus.PAID,
      OrderStatus.USER_CANCELED,
    ])

    const onConfirm = vi.fn()
    const {container} = render(
      <OrderActionsPanel
        status={OrderStatus.IN_STORE_PAYMENT}
        onMove={noop}
        onConfirm={onConfirm}
        onShip={noop}
      />,
    )

    // Open the dropdown
    const triggerButton = container.querySelector('button[type="button"]:last-of-type')!
    fireEvent.click(triggerButton)

    // Click the cancel item in the dropdown
    const cancelMeta = TRANSITION_META.find((m) => m.target === OrderStatus.USER_CANCELED)!
    const menuItems = document.body.querySelectorAll('[role="menuitem"]')
    const cancelItem = Array.from(menuItems).find((item) => item.textContent === cancelMeta.label)!
    fireEvent.click(cancelItem)

    expect(onConfirm).toHaveBeenCalledWith('cancel-customer')
  })
})
