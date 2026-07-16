import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, fireEvent } from '@testing-library/react'
import { DropdownMenu, DropdownItem } from '../DropdownMenu'

/**
 * Property 2: Preservation — Menu Interactions and DataTable Layout Unchanged
 *
 * For all menu interaction sequences (open, click-outside, Escape, item-click),
 * the menu state transitions are preserved. These tests run on UNFIXED code to
 * establish the baseline behavior that must remain intact after the portal fix.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

// --- Arbitraries ---

/** Interaction types that close an open menu */
type CloseInteraction = 'click-outside' | 'escape' | 'item-click'

const closeInteractionArb: fc.Arbitrary<CloseInteraction> = fc.constantFrom(
  'click-outside',
  'escape',
  'item-click',
)

/** Menu item count arbitrary (1-6 items, realistic range) */
const menuItemCountArb = fc.integer({ min: 1, max: 6 })

/** Menu alignment arbitrary */
const alignArb: fc.Arbitrary<'left' | 'right'> = fc.constantFrom('left', 'right')

/** Sequence of open-close interactions */
const interactionSequenceArb = fc.array(closeInteractionArb, { minLength: 1, maxLength: 5 })

// --- Helpers ---

function renderDropdownMenu(
  itemCount: number,
  align: 'left' | 'right',
  onItemClick: () => void,
) {
  const items = Array.from({ length: itemCount }, (_, i) => (
    <DropdownItem key={i} onClick={onItemClick}>
      Item {i + 1}
    </DropdownItem>
  ))

  return render(
    <div>
      <div data-testid="outside-area">Outside</div>
      <DropdownMenu trigger={<span>Open Menu</span>} align={align}>
        {items}
      </DropdownMenu>
    </div>,
  )
}

function getMenuPanel(): HTMLElement | null {
  return document.body.querySelector('[role="menu"]')
}

function getTriggerButton(container: HTMLElement): HTMLElement {
  return container.querySelector('button[type="button"]')!
}

function getMenuItems(): NodeListOf<HTMLElement> {
  return document.body.querySelectorAll('[role="menuitem"]')
}

describe('DropdownMenu Preservation — Property 2: Menu Interactions', () => {
  it('clicking outside the menu closes it for any menu configuration', () => {
    fc.assert(
      fc.property(menuItemCountArb, alignArb, (itemCount, align) => {
        const onClick = vi.fn()
        const { container, unmount } = renderDropdownMenu(itemCount, align, onClick)

        // Open the menu
        fireEvent.click(getTriggerButton(container))
        expect(getMenuPanel()).not.toBeNull()

        // Click outside
        fireEvent.mouseDown(document.body)
        expect(getMenuPanel()).toBeNull()

        unmount()
      }),
      { numRuns: 30 },
    )
  })

  it('pressing Escape closes the menu for any menu configuration', () => {
    fc.assert(
      fc.property(menuItemCountArb, alignArb, (itemCount, align) => {
        const onClick = vi.fn()
        const { container, unmount } = renderDropdownMenu(itemCount, align, onClick)

        // Open the menu
        fireEvent.click(getTriggerButton(container))
        expect(getMenuPanel()).not.toBeNull()

        // Press Escape
        fireEvent.keyDown(document, { key: 'Escape' })
        expect(getMenuPanel()).toBeNull()

        unmount()
      }),
      { numRuns: 30 },
    )
  })

  it('clicking a menu item invokes the onClick handler for any menu configuration', () => {
    fc.assert(
      fc.property(menuItemCountArb, alignArb, (itemCount, align) => {
        const onClick = vi.fn()
        const { container, unmount } = renderDropdownMenu(itemCount, align, onClick)

        // Open the menu
        fireEvent.click(getTriggerButton(container))
        expect(getMenuPanel()).not.toBeNull()

        // Click the first menu item — onClick is invoked
        const items = getMenuItems()
        expect(items.length).toBe(itemCount)
        fireEvent.click(items[0])
        expect(onClick).toHaveBeenCalledTimes(1)

        // Note: In the current implementation, clicking a menu item does NOT
        // automatically close the menu (it stays open). The menu only closes
        // via click-outside or Escape. This is the observed baseline behavior.
        // The menu panel is still present after item click.
        expect(getMenuPanel()).not.toBeNull()

        unmount()
      }),
      { numRuns: 30 },
    )
  })

  it('menu state transitions are preserved across arbitrary interaction sequences', () => {
    fc.assert(
      fc.property(
        menuItemCountArb,
        alignArb,
        interactionSequenceArb,
        (itemCount, align, interactions) => {
          const onClick = vi.fn()
          const { container, unmount } = renderDropdownMenu(itemCount, align, onClick)

          let menuIsOpen = false

          for (const interaction of interactions) {
            // Open the menu if not already open
            if (!menuIsOpen) {
              fireEvent.click(getTriggerButton(container))
              expect(getMenuPanel()).not.toBeNull()
              menuIsOpen = true
            }

            // Close via the chosen interaction
            switch (interaction) {
              case 'click-outside':
                fireEvent.mouseDown(document.body)
                expect(getMenuPanel()).toBeNull()
                menuIsOpen = false
                break
              case 'escape':
                fireEvent.keyDown(document, { key: 'Escape' })
                expect(getMenuPanel()).toBeNull()
                menuIsOpen = false
                break
              case 'item-click': {
                // Clicking a menu item invokes onClick but does NOT close the menu
                const items = getMenuItems()
                fireEvent.click(items[0])
                expect(onClick).toHaveBeenCalled()
                // Menu stays open — need to close it via another mechanism
                expect(getMenuPanel()).not.toBeNull()
                // Close explicitly with click-outside so subsequent iterations start clean
                fireEvent.mouseDown(document.body)
                expect(getMenuPanel()).toBeNull()
                menuIsOpen = false
                break
              }
            }
          }

          unmount()
        },
      ),
      { numRuns: 20 },
    )
  })

  it('toggle behavior: clicking trigger when open closes it, clicking when closed opens it', () => {
    fc.assert(
      fc.property(menuItemCountArb, alignArb, (itemCount, align) => {
        const onClick = vi.fn()
        const { container, unmount } = renderDropdownMenu(itemCount, align, onClick)

        // Initially closed
        expect(getMenuPanel()).toBeNull()

        // Click to open
        fireEvent.click(getTriggerButton(container))
        expect(getMenuPanel()).not.toBeNull()

        // Click trigger again to close (toggle)
        fireEvent.click(getTriggerButton(container))
        expect(getMenuPanel()).toBeNull()

        // Click to open again
        fireEvent.click(getTriggerButton(container))
        expect(getMenuPanel()).not.toBeNull()

        unmount()
      }),
      { numRuns: 20 },
    )
  })
})
