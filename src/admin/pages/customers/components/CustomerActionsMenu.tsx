import { EllipsisVertical } from 'lucide-react'

import type { AdminCustomerSummary } from '@/admin/hooks/customers/types'
import { getAvailableActions } from '@/admin/hooks/customers/types'
import { DropdownMenu, DropdownItem } from '@/shared/ui/components'

export interface CustomerActionsMenuProps {
  customer: AdminCustomerSummary
  onActivate: () => void
  onSuspend: () => void
}

const actionConfig: Record<
  'activate' | 'suspend',
  { label: string; handler: keyof Pick<CustomerActionsMenuProps, 'onActivate' | 'onSuspend'>; destructive?: boolean }
> = {
  activate: { label: 'Activate', handler: 'onActivate' },
  suspend: { label: 'Suspend', handler: 'onSuspend', destructive: true },
}

export function CustomerActionsMenu({
  customer,
  onActivate,
  onSuspend,
}: CustomerActionsMenuProps) {
  const availableActions = getAvailableActions(customer.status)

  if (availableActions.length === 0) {
    return null
  }

  const handlers: Record<string, () => void> = {
    onActivate,
    onSuspend,
  }

  return (
    <div data-testid="customer-actions-menu">
      <DropdownMenu
        trigger={
          <span className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)">
            <EllipsisVertical className="h-5 w-5 text-(--c-text-muted)" />
          </span>
        }
      >
        {availableActions.map((action) => {
          const config = actionConfig[action]

          return (
            <div key={action} data-testid={`action-${config.label.toLowerCase()}`}>
              <DropdownItem
                onClick={handlers[config.handler]}
                destructive={config.destructive}
              >
                {config.label}
              </DropdownItem>
            </div>
          )
        })}
      </DropdownMenu>
    </div>
  )
}
