import {CheckCircle2, ChevronDown, ChevronRight, Zap} from 'lucide-react'
import {Button, Card} from '@/shared/ui/primitives'
import {DropdownItem, DropdownMenu} from '@/shared/ui/components'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {ConfirmedAction} from '../utils/confirmedActions'
import {getAvailableTransitions} from '../utils/getAvailableTransitions'
import {ORDER_ACTIONS, type OrderAction} from '../utils/orderActions'

export interface OrderActionsPanelProps {
    status: OrderStatus
    onConfirm: (action: ConfirmedAction) => void
    onShip: () => void
}

export function OrderActionsPanel({status, onConfirm, onShip}: OrderActionsPanelProps) {
    const available = getAvailableTransitions(status)
    const transitions = ORDER_ACTIONS.filter((m) => available.includes(m.target))

    if (transitions.length === 0) {
        return null
    }

    // Every transition confirms before it runs (OrderAction.prompt is required) — this is
    // just the ship/generic-confirm fork, never a direct unconfirmed move.
    const handleTransition = (meta: OrderAction) => {
        if (meta.prompt === 'ship') {
            onShip()
        } else {
            onConfirm(meta.prompt)
        }
    }

    const [primary, ...rest] = transitions

    return (
        <Card as="section" variant="bordered" data-testid="order-actions-panel">
            <Card.Body className="flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                    <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-success)/15 text-(--c-success)">
                        <Zap className="h-4 w-4"/>
                    </span>
                    <h3 className="text-base font-semibold text-(--c-text)">
                        Order Actions
                    </h3>
                </div>

                <Button
                    variant={primary.destructive ? 'outline' : 'solid'}
                    size="lg"
                    className="w-full justify-between"
                    leftIcon={!primary.destructive && <CheckCircle2 className="h-4 w-4"/>}
                    rightIcon={<ChevronRight className="h-4 w-4"/>}
                    onClick={() => handleTransition(primary)}
                >
                    {primary.label}
                </Button>

                {rest.length > 0 && (
                    <>
                        <div className="flex items-center gap-3 text-xs text-(--c-text-muted)">
                            <span className="h-px flex-1 bg-(--c-border)"/>
                            or
                            <span className="h-px flex-1 bg-(--c-border)"/>
                        </div>

                        <DropdownMenu
                            className="w-full"
                            matchTriggerWidth
                            offset={4}
                            trigger={
                                <span
                                    className="flex h-(--c-control-h-md) w-full items-center justify-between rounded-(--c-radius) border border-(--c-border) px-4 text-sm font-medium text-(--c-text) transition-colors hover:border-(--c-accent) hover:text-(--c-accent)">
                                    More actions
                                    <ChevronDown className="h-4 w-4"/>
                                </span>
                            }
                        >
                            {rest.map((meta) =>
                                meta.icon ? (
                                    <DropdownItem key={meta.target} onClick={() => handleTransition(meta)}>
                                        <span className="flex items-center gap-3">
                                            <span
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-error)/15 text-(--c-error)">
                                                <meta.icon className="h-4 w-4"/>
                                            </span>
                                            <span>
                                                <span className="block text-sm font-semibold text-(--c-text)">
                                                    {meta.label}
                                                </span>
                                                <span className="block text-xs text-(--c-text-muted)">
                                                    {meta.description}
                                                </span>
                                            </span>
                                        </span>
                                    </DropdownItem>
                                ) : (
                                    <DropdownItem
                                        key={meta.target} onClick={() => handleTransition(meta)}
                                        destructive={meta.destructive}>
                                        {meta.label}
                                    </DropdownItem>
                                ),
                            )}
                        </DropdownMenu>
                    </>
                )}
            </Card.Body>
        </Card>
    )
}
