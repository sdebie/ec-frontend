import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useOrderStatusConfirmation } from '../useOrderStatusConfirmation'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * The payload shape is the contract with the server. Testing it here covers both the
 * list and the detail page at once — the reason this state was extracted in the first
 * place, after the two had drifted apart with only one of them tested.
 */
describe('useOrderStatusConfirmation', () => {
  it('sends the target status of the action that was confirmed', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.DELIVERED))
    expect(result.current.buildPayload()).toEqual({
      orderId: 'o1',
      status: OrderStatus.REFUNDED,
    })

    act(() => result.current.ask('cancel-staff', 'o2', OrderStatus.PAID))
    expect(result.current.buildPayload()).toEqual({
      orderId: 'o2',
      status: OrderStatus.ADMIN_CANCELED,
    })

    act(() => result.current.ask('cancel-customer', 'o3', OrderStatus.PAID))
    expect(result.current.buildPayload()).toEqual({
      orderId: 'o3',
      status: OrderStatus.USER_CANCELED,
    })
  })

  /**
   * What happens to an order's stock follows from the status it moves to, so the
   * payload carries no stock instruction at all — there is nothing here for a staff
   * member to answer, and nothing a caller could use to move stock by asking.
   */
  it('never carries a stock instruction, on any action', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    for (const action of [
      'refund',
      'refund-partial',
      'cancel-staff',
      'cancel-customer',
      'await-in-store-payment',
      'return-to-origin',
    ] as const) {
      act(() => result.current.ask(action, 'o1', OrderStatus.PAID))
      expect(Object.keys(result.current.buildPayload())).toEqual(['orderId', 'status'])
    }
  })

  it('snapshots the status it was opened with, so a background refetch cannot reword the prompt', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.DELIVERED))
    expect(result.current.state.fromStatus).toBe(OrderStatus.DELIVERED)
    expect(result.current.state.open).toBe(true)
  })

  it('keeps the action details while closing so the dialog can animate out', () => {
    const { result } = renderHook(() => useOrderStatusConfirmation())

    act(() => result.current.ask('refund', 'o1', OrderStatus.DELIVERED))
    act(() => result.current.close())

    expect(result.current.state.open).toBe(false)
    expect(result.current.state.type).toBe('refund')
    expect(result.current.state.orderId).toBe('o1')
  })
})
