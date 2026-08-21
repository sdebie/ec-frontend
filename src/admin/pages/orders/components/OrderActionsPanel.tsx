import {Button, Card} from '@/shared/ui/primitives'
import {DropdownItem, DropdownMenu} from '@/shared/ui/components'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {ConfirmedAction} from '../utils/confirmedActions'
import {getAvailableTransitions} from '../utils/getAvailableTransitions'
import {TRANSITION_META, type TransitionMeta} from '../utils/transitionMetadata'

export interface OrderActionsPanelProps {
  status: OrderStatus
  onMove: (status: OrderStatus) => void
  onConfirm: (action: ConfirmedAction) => void
  onShip: () => void
}

export function OrderActionsPanel({status, onMove, onConfirm, onShip}: OrderActionsPanelProps) {
  const available = getAvailableTransitions(status)
  const transitions = TRANSITION_META.filter((m) => available.includes(m.target))

  if (transitions.length === 0) {
    return null
  }

  const handleTransition = (meta: TransitionMeta) => {
    if (meta.prompt === 'ship') {
      onShip()
    } else if (meta.prompt) {
      onConfirm(meta.prompt)
    } else {
      onMove(meta.target)
    }
  }

  const [primary, ...rest] = transitions

  return (
    <Card as="section" variant="bordered" data-testid="order-actions-panel">
      <Card.Header className="m-0 px-5 py-4">Order Actions</Card.Header>
      <Card.Body className="flex items-center gap-3 p-5">
        <Button variant="solid" size="sm" onClick={() => handleTransition(primary)}>
          {primary.label}
        </Button>

        {rest.length > 0 && (
          <DropdownMenu
            trigger={
              <span className="inline-flex items-center justify-center rounded-(--c-radius) border border-(--c-border) bg-transparent px-3 text-xs font-medium text-(--c-text) h-(--c-control-h-sm) hover:border-(--c-accent) hover:text-(--c-accent) transition-colors">
                More actions
              </span>
            }
          >
            {rest.map((meta) => (
              <DropdownItem
                key={meta.target}
                onClick={() => handleTransition(meta)}
                destructive={meta.destructive}
              >
                {meta.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        )}
      </Card.Body>
    </Card>
  )
}
