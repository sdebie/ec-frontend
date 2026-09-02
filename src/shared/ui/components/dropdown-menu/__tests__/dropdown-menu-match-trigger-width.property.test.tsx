import { describe, it, expect, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { DropdownMenu, DropdownItem } from '../DropdownMenu'

/**
 * Property: with `matchTriggerWidth`, the floating menu's rendered width always equals
 * the trigger's rendered width, for any trigger width — not just the case that happened
 * to be eyeballed in the browser.
 */

function mockTriggerRect(width: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height: 40,
    top: 100,
    left: 50,
    right: 50 + width,
    bottom: 140,
    x: 50,
    y: 100,
    toJSON: () => {},
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})

describe('DropdownMenu matchTriggerWidth', () => {
  it('sizes the floating menu to the trigger width, for any trigger width', () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 800 }), (width) => {
        mockTriggerRect(width)

        const { container } = render(
          <DropdownMenu matchTriggerWidth trigger={<span>More actions</span>}>
            <DropdownItem onClick={() => {}}>Action</DropdownItem>
          </DropdownMenu>,
        )

        fireEvent.click(container.querySelector('button')!)

        const menuPanel = document.querySelector('[role="menu"]') as HTMLElement
        expect(menuPanel.style.width).toBe(`${width}px`)

        cleanup()
      }),
      { numRuns: 20 },
    )
  })

  it('does not set an explicit width when matchTriggerWidth is omitted (default behavior unchanged)', () => {
    mockTriggerRect(300)

    const { container } = render(
      <DropdownMenu trigger={<span>Open</span>}>
        <DropdownItem onClick={() => {}}>Action</DropdownItem>
      </DropdownMenu>,
    )

    fireEvent.click(container.querySelector('button')!)

    const menuPanel = document.querySelector('[role="menu"]') as HTMLElement
    expect(menuPanel.style.width).toBe('')
    expect(menuPanel.className).toContain('min-w-[12rem]')
  })
})
