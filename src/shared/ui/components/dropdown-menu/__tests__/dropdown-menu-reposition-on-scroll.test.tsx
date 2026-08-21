import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { DropdownMenu, DropdownItem } from '../DropdownMenu'

/**
 * Bug: the floating menu is `position: fixed`, positioned once (from the trigger's
 * getBoundingClientRect) at the moment it opens. A `position: fixed` element does not move
 * with page scroll on its own, so once the trigger scrolls to a new viewport position, the
 * open menu is left behind — it visually "detaches" from the trigger, exactly as reported.
 *
 * Fix: recompute position on `scroll` (capture, so a nested scrollable ancestor counts too)
 * and `resize` while the menu is open, not just once on open.
 */

let currentRect: DOMRect

function mockTriggerRect(top: number) {
  currentRect = {
    width: 200,
    height: 40,
    top,
    left: 50,
    right: 250,
    bottom: top + 40,
    x: 50,
    y: top,
    toJSON: () => {},
  } as DOMRect
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => currentRect)
})

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})

describe('DropdownMenu — stays pinned to the trigger while open', () => {
  it('recomputes position on scroll instead of staying at the position it opened at', () => {
    mockTriggerRect(100)

    const { container } = render(
      <DropdownMenu trigger={<span>More actions</span>}>
        <DropdownItem onClick={() => {}}>Action</DropdownItem>
      </DropdownMenu>,
    )

    fireEvent.click(container.querySelector('button')!)

    const menuPanel = document.querySelector('[role="menu"]') as HTMLElement
    expect(menuPanel.style.top).toBe('148px') // rect.bottom (100 + 40) + 8

    // The trigger has now scrolled to a new viewport position (e.g. the page scrolled).
    mockTriggerRect(400)
    fireEvent.scroll(window)

    expect(menuPanel.style.top).toBe('448px') // 440 + 8 — must follow, not stay at 148px
  })

  it('recomputes position on window resize', () => {
    mockTriggerRect(100)

    const { container } = render(
      <DropdownMenu trigger={<span>More actions</span>}>
        <DropdownItem onClick={() => {}}>Action</DropdownItem>
      </DropdownMenu>,
    )

    fireEvent.click(container.querySelector('button')!)

    mockTriggerRect(250)
    fireEvent.resize(window)

    const menuPanel = document.querySelector('[role="menu"]') as HTMLElement
    expect(menuPanel.style.top).toBe('298px') // rect.bottom (250 + 40) + 8
  })

  it('stops listening once closed (no stray listener recomputing a stale/unmounted menu)', () => {
    mockTriggerRect(100)

    const { container } = render(
      <DropdownMenu trigger={<span>More actions</span>}>
        <DropdownItem onClick={() => {}}>Action</DropdownItem>
      </DropdownMenu>,
    )

    const triggerButton = container.querySelector('button')!
    fireEvent.click(triggerButton) // open
    fireEvent.click(triggerButton) // close

    expect(document.querySelector('[role="menu"]')).toBeNull()

    // Should not throw / do anything observable once closed.
    mockTriggerRect(999)
    expect(() => fireEvent.scroll(window)).not.toThrow()
  })
})
