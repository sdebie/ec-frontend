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

function metaFor(target: OrderStatus) {
  return TRANSITION_META.find((m) => m.target === target)!
}

function openMoreActions() {
  fireEvent.click(screen.getByRole('button', {name: /More actions/}))
}

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

    const processingMeta = metaFor(OrderStatus.PROCESSING)
    expect(screen.getByRole('button', {name: processingMeta.label})).toBeInTheDocument()
  })

  it('does not render "More actions" or the "or" divider when only one transition is available', () => {
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
    expect(screen.queryByText('or')).not.toBeInTheDocument()
  })

  it('opens a floating dropdown menu (portaled, role="menu") to show remaining transitions when "More actions" is clicked', () => {
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

    expect(screen.queryByText(metaFor(OrderStatus.USER_CANCELED).label)).not.toBeInTheDocument()

    openMoreActions()

    // Reuses the shared DropdownMenu component (portaled to document.body) — not an inline expand.
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    expect(screen.getByText(metaFor(OrderStatus.USER_CANCELED).label)).toBeInTheDocument()
    expect(screen.getByText(metaFor(OrderStatus.ADMIN_CANCELED).label)).toBeInTheDocument()
  })

  it('renders cancel transitions with an icon badge and their description in the dropdown', () => {
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

    openMoreActions()

    expect(screen.getByText('Customer requested cancellation')).toBeInTheDocument()
    expect(screen.getByText('Cancelled by store')).toBeInTheDocument()
  })

  it('applies destructive text styling to a non-cancel destructive transition (no icon badge)', () => {
    // TRANSITION_META's declaration order (not the array passed here) decides primary vs. rest —
    // PARTIALLY_REFUNDED is declared before REFUNDED, so REFUNDED is what lands in "rest" here.
    mockedGetAvailableTransitions.mockReturnValue([OrderStatus.REFUNDED, OrderStatus.PARTIALLY_REFUNDED])

    render(
      <OrderActionsPanel
        status={OrderStatus.DELIVERED}
        onMove={noop}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    openMoreActions()

    const refundMeta = metaFor(OrderStatus.REFUNDED)
    const item = screen.getByText(refundMeta.label).closest('button')!
    expect(item.className).toContain('text-(--c-error)')
  })

  it('renders the primary button without a checkmark icon when the only available transition is destructive', () => {
    mockedGetAvailableTransitions.mockReturnValue([OrderStatus.REFUNDED])

    render(
      <OrderActionsPanel
        status={OrderStatus.DELIVERED}
        onMove={noop}
        onConfirm={noop}
        onShip={noop}
      />,
    )

    const refundMeta = metaFor(OrderStatus.REFUNDED)
    const primaryButton = screen.getByRole('button', {name: refundMeta.label})
    // outline variant (no solid accent background) — reflects that this primary action is destructive
    expect(primaryButton.className).not.toContain('bg-(--c-accent)')
    expect(primaryButton.querySelectorAll('svg').length).toBe(1) // chevron only, no leading checkmark
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

    fireEvent.click(screen.getByRole('button', {name: metaFor(OrderStatus.PROCESSING).label}))

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

    fireEvent.click(screen.getByRole('button', {name: metaFor(OrderStatus.USER_CANCELED).label}))

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

    fireEvent.click(screen.getByRole('button', {name: metaFor(OrderStatus.IN_TRANSIT).label}))

    expect(onShip).toHaveBeenCalled()
  })

  it('calls onConfirm via a dropdown cancel item for prompted transitions', () => {
    mockedGetAvailableTransitions.mockReturnValue([OrderStatus.PAID, OrderStatus.USER_CANCELED])

    const onConfirm = vi.fn()
    render(
      <OrderActionsPanel
        status={OrderStatus.IN_STORE_PAYMENT}
        onMove={noop}
        onConfirm={onConfirm}
        onShip={noop}
      />,
    )

    openMoreActions()

    const cancelMeta = metaFor(OrderStatus.USER_CANCELED)
    fireEvent.click(screen.getByText(cancelMeta.label).closest('button')!)

    expect(onConfirm).toHaveBeenCalledWith('cancel-customer')
  })
})
