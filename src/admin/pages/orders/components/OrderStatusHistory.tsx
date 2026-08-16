import {Check} from 'lucide-react'
import type {OrderStatusHistoryEntry} from '@/admin/pages/orders/types'
import {OrderStatusDisplay} from '@/shared/ui/components'
import {formatDateTime} from '@/shared/utils/formatDateTime'

export interface OrderStatusHistoryProps {
    history: OrderStatusHistoryEntry[]
}

export function OrderStatusHistory({history}: OrderStatusHistoryProps) {

    if (history.length === 0) {
        return null
    }

    return (
        <div className="relative" data-testid="order-status-history">
            <ul className="space-y-0">
                {history.map((entry, index) => {
                    const isLast = index === history.length - 1
                    const isCurrent = index === 0
                    return (
                        <li key={index} className="relative flex gap-4">
                            {!isLast && (
                                <div
                                    className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${
                                        isCurrent ? 'bg-(--c-accent)' : 'bg-(--c-border)'
                                    }`}
                                    aria-hidden="true"
                                />
                            )}

                            <div className="relative z-10 shrink-0">
                                {isCurrent ? (
                                    <div
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-(--c-accent)">
                                        <Check className="h-3.5 w-3.5 text-(--c-accent-text)" aria-hidden="true"/>
                                    </div>
                                ) : (
                                    <div
                                        className={`h-7 w-7 rounded-full border-[5px] bg-(--c-panel) 
                                        ${isLast ? 'border-(--c-accent)' : 'border-(--c-surface-hover)'}`
                                        }
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-1 pb-6 pt-0.5">
                                <OrderStatusDisplay status={entry.status}/>
                                {entry.staffName && (
                                    <span className="text-xs text-(--c-text-muted)">
                                        by
                                        <span className="font-semibold text-(--c-text)">
                                            {entry.staffName}
                                        </span>
                                    </span>
                                )}
                                <span className="text-[11px] text-(--c-text-muted)">
                                    {formatDateTime(entry.timestamp)}
                                </span>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
