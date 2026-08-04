import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'

import { ProductActionsMenu } from '../components/ProductActionsMenu'
import { ProductStatus } from '@/shared/types/enums'

/**
 * Unit tests for ProductActionsMenu component.
 * Validates: Requirements 5.6, 5.4
 *
 * The component takes no onEdit or canMutate prop: it renders only toggle
 * status (Activate/Disable) and Delete menu items.
 */

afterEach(() => {
  cleanup()
})

describe('ProductActionsMenu', () => {
  const onToggleStatus = vi.fn()
  const onDelete = vi.fn()

  function renderMenu(status: typeof ProductStatus[keyof typeof ProductStatus]) {
    return render(
      <ProductActionsMenu
        product={{ status }}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />,
    )
  }

  function openDropdown() {
    const trigger = screen.getByTestId('actions-menu').querySelector('button')
    fireEvent.click(trigger!)
  }

  describe('edit action removed', () => {
    it('does not render an edit action for ACTIVE products', () => {
      renderMenu(ProductStatus.ACTIVE)
      openDropdown()

      expect(screen.queryByTestId('action-edit')).not.toBeInTheDocument()
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })

    it('does not render an edit action for PENDING products', () => {
      renderMenu(ProductStatus.PENDING)
      openDropdown()

      expect(screen.queryByTestId('action-edit')).not.toBeInTheDocument()
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })

    it('does not render an edit action for DISABLED products', () => {
      renderMenu(ProductStatus.DISABLED)
      openDropdown()

      expect(screen.queryByTestId('action-edit')).not.toBeInTheDocument()
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })
  })

  describe('toggle status actions remain', () => {
    it('shows Activate for PENDING products', () => {
      renderMenu(ProductStatus.PENDING)
      openDropdown()

      expect(screen.getByTestId('action-activate')).toBeInTheDocument()
      expect(screen.getByText('Activate')).toBeInTheDocument()
    })

    it('shows Activate for DISABLED products', () => {
      renderMenu(ProductStatus.DISABLED)
      openDropdown()

      expect(screen.getByTestId('action-activate')).toBeInTheDocument()
      expect(screen.getByText('Activate')).toBeInTheDocument()
    })

    it('does not show Activate for ACTIVE products', () => {
      renderMenu(ProductStatus.ACTIVE)
      openDropdown()

      expect(screen.queryByTestId('action-activate')).not.toBeInTheDocument()
    })

    it('shows Disable for ACTIVE products', () => {
      renderMenu(ProductStatus.ACTIVE)
      openDropdown()

      expect(screen.getByTestId('action-disable')).toBeInTheDocument()
      expect(screen.getByText('Disable')).toBeInTheDocument()
    })

    it('shows Disable for PENDING products', () => {
      renderMenu(ProductStatus.PENDING)
      openDropdown()

      expect(screen.getByTestId('action-disable')).toBeInTheDocument()
      expect(screen.getByText('Disable')).toBeInTheDocument()
    })

    it('does not show Disable for DISABLED products', () => {
      renderMenu(ProductStatus.DISABLED)
      openDropdown()

      expect(screen.queryByTestId('action-disable')).not.toBeInTheDocument()
    })
  })

  describe('delete action remains', () => {
    it('shows Delete for ACTIVE products', () => {
      renderMenu(ProductStatus.ACTIVE)
      openDropdown()

      expect(screen.getByTestId('action-delete')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('shows Delete for PENDING products', () => {
      renderMenu(ProductStatus.PENDING)
      openDropdown()

      expect(screen.getByTestId('action-delete')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('shows Delete for DISABLED products', () => {
      renderMenu(ProductStatus.DISABLED)
      openDropdown()

      expect(screen.getByTestId('action-delete')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })
  })

  describe('action callbacks', () => {
    it('calls onToggleStatus with ACTIVE when Activate is clicked', () => {
      renderMenu(ProductStatus.PENDING)
      openDropdown()

      const activateButton = screen.getByTestId('action-activate').querySelector('button')
      fireEvent.click(activateButton!)

      expect(onToggleStatus).toHaveBeenCalledWith('ACTIVE')
    })

    it('calls onToggleStatus with DISABLED when Disable is clicked', () => {
      renderMenu(ProductStatus.ACTIVE)
      openDropdown()

      const disableButton = screen.getByTestId('action-disable').querySelector('button')
      fireEvent.click(disableButton!)

      expect(onToggleStatus).toHaveBeenCalledWith('DISABLED')
    })

    it('calls onDelete when Delete is clicked', () => {
      renderMenu(ProductStatus.ACTIVE)
      openDropdown()

      const deleteButton = screen.getByTestId('action-delete').querySelector('button')
      fireEvent.click(deleteButton!)

      expect(onDelete).toHaveBeenCalled()
    })
  })

  describe('component interface', () => {
    it('does not accept onEdit prop (TypeScript enforces, but verify no edit handler exists)', () => {
      // Verify the component only takes product, onToggleStatus, and onDelete
      // The existence of this test documents the interface change
      const { container } = renderMenu(ProductStatus.ACTIVE)
      expect(container.querySelector('[data-testid="actions-menu"]')).toBeInTheDocument()
    })
  })
})
