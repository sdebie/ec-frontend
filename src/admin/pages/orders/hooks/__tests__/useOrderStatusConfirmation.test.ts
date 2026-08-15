import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useOrderStatusConfirmation } from '../useOrderStatusConfirmation'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * The payload shape is the contract with the server, which rejects a restock decision
 * on any non-refund transition and a refund without one. Testing it here covers both
 * pages at once — the reason this state was extracted in the first place.
 */
describe('useOrderStatusConfirmation', () => {
  it('attaches restockItems only to a refund', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.PAID))
    expect(result.current.buildPayload()).toEqual({
      orderId: 'o1',
      status: OrderStatus.REFUNDED,
      restockItems: true,
    })

    act(() => result.current.ask('cancel', 'o2', OrderStatus.PAID))
    const cancelPayload = result.current.buildPayload()
    expect(cancelPayload).toEqual({ orderId: 'o2', status: OrderStatus.CANCELLED })
    expect(cancelPayload).not.toHaveProperty('restockItems')

    act(() => result.current.ask('mark-paid-in-store', 'o3', OrderStatus.CREATED))
    expect(result.current.buildPayload()).not.toHaveProperty('restockItems')
  })

  it('defaults the restock decision from the status being acted on', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.PAID))
    expect(result.current.restockItems).toBe(true)

    act(() => result.current.ask('refund', 'o2', OrderStatus.DELIVERED))
    expect(result.current.restockItems).toBe(false)
  })

  it('re-derives the default on every open, never inheriting the previous answer', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.DELIVERED))
    act(() => result.current.setRestockItems(true))
    act(() => result.current.close())

    // A second refund, on an order that happens to share the first one's status:
    // the default must come from the order, not from what was ticked last time.
    act(() => result.current.ask('refund', 'o2', OrderStatus.DELIVERED))
    expect(result.current.restockItems).toBe(false)
  })

  it('sends the staff answer rather than the default once it is changed', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.PAID))
    act(() => result.current.setRestockItems(false))

    expect(result.current.buildPayload()).toEqual({
      orderId: 'o1',
      status: OrderStatus.REFUNDED,
      restockItems: false,
    })
  })

  it('snapshots the status it was opened with, so a background refetch cannot reword the prompt', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.DELIVERED))
    expect(result.current.state.fromStatus).toBe(OrderStatus.DELIVERED)
    expect(result.current.state.open).toBe(true)
  })

  it('keeps the action details while closing so the dialog can animate out', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.PAID))
    act(() => result.current.close())

    expect(result.current.state.open).toBe(false)
    expect(result.current.state.type).toBe('refund')
    expect(result.current.state.orderId).toBe('o1')
  })
})
