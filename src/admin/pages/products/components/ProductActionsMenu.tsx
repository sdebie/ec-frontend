import { MoreHorizontal } from 'lucide-react'

import { DropdownMenu, DropdownItem } from '@/shared/ui/components'
import { ProductStatus } from '@/shared/types/enums'

export interface ProductActionsMenuProps {
  product: { status: ProductStatus }
  onToggleStatus: (targetStatus: 'ACTIVE' | 'DISABLED') => void
  onDelete: () => void
}

export function ProductActionsMenu({
  product,
  onToggleStatus,
  onDelete,
}: ProductActionsMenuProps) {
  return (
    <div data-testid="actions-menu">
      <DropdownMenu
        trigger={
          <span className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)">
            <MoreHorizontal className="h-5 w-5 text-(--c-text-muted)" />
          </span>
        }
      >
        {product.status !== ProductStatus.ACTIVE && (
          <div data-testid="action-activate">
            <DropdownItem onClick={() => onToggleStatus('ACTIVE')}>
              Activate
            </DropdownItem>
          </div>
        )}

        {product.status !== ProductStatus.DISABLED && (
          <div data-testid="action-disable">
            <DropdownItem onClick={() => onToggleStatus('DISABLED')}>
              Disable
            </DropdownItem>
          </div>
        )}

        <div data-testid="action-delete">
          <DropdownItem onClick={onDelete} destructive>
            Delete
          </DropdownItem>
        </div>
      </DropdownMenu>
    </div>
  )
}
