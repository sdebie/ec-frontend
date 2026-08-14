import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { render, fireEvent } from '@testing-library/react'
import { DropdownMenu, DropdownItem } from '../DropdownMenu'

/**
 * Property 1: Bug Condition — Dropdown Menu Clipped in Overflow Containers
 *
 * When a DropdownMenu is rendered inside a container with `overflow: hidden` and
 * a fixed height (simulating the DataTable's overflow-hidden outer wrapper), and
 * the menu is opened, the menu panel SHOULD be rendered into `document.body` via
 * a React portal with `position: fixed`, escaping the overflow boundary.
 *
 * This test is EXPECTED TO FAIL on unfixed code because the current DropdownMenu
 * renders the menu with `position: absolute` as a child of the trigger's relative
 * container — it does NOT use a portal.
 *
 */

// Arbitrary for container dimensions that would cause clipping
// Container height is small (50-150px), so the menu extends beyond it
const containerConfigArb = fc.record({
  containerHeight: fc.integer({ min: 50, max: 150 }),
  containerWidth: fc.integer({ min: 200, max: 400 }),
  menuItemCount: fc.integer({ min: 3, max: 8 }),
})

describe('DropdownMenu Bug Condition — Menu Clipped in Overflow Containers (Property 1)', () => {
  it('renders menu panel via portal into document.body when opened inside overflow-hidden container', () => {
    fc.assert(
      fc.property(containerConfigArb, ({ containerHeight, containerWidth, menuItemCount }) => {
        const menuItems = Array.from({ length: menuItemCount }, (_, i) => `Action ${i + 1}`)

        const { container } = render(
          <div
            style={{
              overflow: 'hidden',
              height: `${containerHeight}px`,
              width: `${containerWidth}px`,
              position: 'relative',
            }}
            data-testid="overflow-container"
          >
            <DropdownMenu trigger={<span>Open Menu</span>}>
              {menuItems.map((item) => (
                <DropdownItem key={item} onClick={() => {}}>
                  {item}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </div>,
        )

        // Open the menu
        const triggerButton = container.querySelector('button')!
        fireEvent.click(triggerButton)

        // Assert: The menu panel should be rendered into document.body via portal
        // (not as a child of the overflow-hidden container)
        const menuPanel = document.querySelector('[role="menu"]')
        expect(menuPanel).not.toBeNull()

        // The menu should be a direct child of document.body (portal rendering)
        const isChildOfBody = menuPanel!.parentElement === document.body ||
          menuPanel!.closest('body > *') !== container.closest('body > *')
        expect(isChildOfBody).toBe(true)

        // The menu should have position: fixed (not absolute)
        const computedStyle = window.getComputedStyle(menuPanel!)
        expect(computedStyle.position).toBe('fixed')
      }),
      { numRuns: 20 },
    )
  })
})
