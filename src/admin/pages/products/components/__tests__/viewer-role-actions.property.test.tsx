import { describe, it, expect, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { render, cleanup, fireEvent } from '@testing-library/react'

import { ProductActionsMenu } from '../ProductActionsMenu'
import { ProductStatus } from '@/shared/types/enums'

/**
 * Property: ProductActionsMenu renders toggle status and delete actions
 *
 * The ProductActionsMenu handles no canMutate gating and no edit actions. It
 * always renders the menu — the parent owns visibility — and contains only
 * toggle status (Activate/Disable) and Delete items.
 *
 * **Validates: Requirements 5.4, 5.6**
 */

const productStatusArb = fc.constantFrom(
  ProductStatus.PENDING,
  ProductStatus.ACTIVE,
  ProductStatus.DISABLED,
)

const noop = () => {}

function openMenu(container: HTMLElement) {
  const trigger = container.querySelector('[data-testid="actions-menu"] button')
  if (trigger) fireEvent.click(trigger)
}

describe('ProductActionsMenu — Property Tests', () => {
  afterEach(() => {
    cleanup()
  })

  it('ProductActionsMenu always renders the menu with delete and without edit for any product status', () => {
    fc.assert(
      fc.property(productStatusArb, (status) => {
        const { container, unmount } = render(
          <ProductActionsMenu
            product={{ status }}
            onToggleStatus={noop}
            onDelete={noop}
          />,
        )

        // The actions-menu wrapper should always be rendered
        expect(container.querySelector('[data-testid="actions-menu"]')).not.toBeNull()

        // Open the dropdown to verify items
        openMenu(container)

        // Menu items are rendered via portal to document.body
        // Edit action should never be present (removed from menu)
        expect(document.body.querySelector('[data-testid="action-edit"]')).toBeNull()

        // Delete action should always be present
        expect(document.body.querySelector('[data-testid="action-delete"]')).not.toBeNull()

        unmount()
      }),
      { numRuns: 100 },
    )
  })

  it('ProductActionsMenu shows Activate only when product is not ACTIVE', () => {
    fc.assert(
      fc.property(productStatusArb, (status) => {
        const { container, unmount } = render(
          <ProductActionsMenu
            product={{ status }}
            onToggleStatus={noop}
            onDelete={noop}
          />,
        )

        openMenu(container)

        // Menu items are rendered via portal to document.body
        const activateAction = document.body.querySelector('[data-testid="action-activate"]')
        if (status === ProductStatus.ACTIVE) {
          expect(activateAction).toBeNull()
        } else {
          expect(activateAction).not.toBeNull()
        }

        unmount()
      }),
      { numRuns: 100 },
    )
  })

  it('ProductActionsMenu shows Disable only when product is not DISABLED', () => {
    fc.assert(
      fc.property(productStatusArb, (status) => {
        const { container, unmount } = render(
          <ProductActionsMenu
            product={{ status }}
            onToggleStatus={noop}
            onDelete={noop}
          />,
        )

        openMenu(container)

        // Menu items are rendered via portal to document.body
        const disableAction = document.body.querySelector('[data-testid="action-disable"]')
        if (status === ProductStatus.DISABLED) {
          expect(disableAction).toBeNull()
        } else {
          expect(disableAction).not.toBeNull()
        }

        unmount()
      }),
      { numRuns: 100 },
    )
  })
})
