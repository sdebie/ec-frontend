import {Check, X} from 'lucide-react'
import {cn} from '@/shared/utils/cn'
import {formatDisplayDateTime} from '@/shared/utils/formatDateTime'
import type {TrackingStep} from '../utils/orderTrackingSteps'

interface OrderTrackingStepperProps {
    steps: TrackingStep[]
    className?: string
}

function subtextFor(step: TrackingStep): string {
    if (step.state === 'current') return 'In progress'
    if (step.state === 'pending') return 'Pending'
    return formatDisplayDateTime(step.timestamp)
}

/**
 * Read-only 5-slot progress tracker for a single order (see getOrderTrackingSteps
 * for how a status/history pair resolves to these slots). Unlike the generic wizard
 * Stepper, a step here can also be 'stopped' — the order was cancelled, failed, or
 * returned partway through, so nothing after that point happened or ever will. What
 * specifically ended it is stated by the status badge shown alongside this tracker,
 * not repeated here.
 */
export function OrderTrackingStepper({steps, className}: OrderTrackingStepperProps) {
    return (
        <nav aria-label="Order progress" className={className}>
            <ol className="flex w-full">
                {steps.map((step, index) => {
                    const isFirst = index === 0
                    const isLast = index === steps.length - 1
                    const leftAccent = !isFirst && (step.state === 'complete' || step.state === 'current' || step.state === 'stopped')
                    const rightAccent = !isLast && step.state === 'complete'

                    return (
                        <li key={step.id} aria-current={step.state === 'current' ? 'step' : undefined}
                            className="flex-1">
                            <div className="flex items-center gap-1">
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'h-0.5 flex-1 rounded-full',
                                        isFirst && 'invisible',
                                        !isFirst && (leftAccent ? 'bg-(--c-accent)' : 'bg-(--c-border)'),
                                    )}
                                />
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                                        step.state === 'complete' && 'bg-(--c-accent) text-(--c-accent-text)',
                                        step.state === 'current' && 'border-2 border-(--c-accent) bg-(--c-panel) text-(--c-accent)',
                                        step.state === 'stopped' && 'bg-(--c-text-muted) text-(--c-panel)',
                                        step.state === 'pending' && 'border border-(--c-border) bg-(--c-panel) text-(--c-text-muted)',
                                    )}
                                >
                                    {step.state === 'complete' && <Check className="h-4 w-4"/>}
                                    {step.state === 'stopped' && <X className="h-4 w-4"/>}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'h-0.5 flex-1 rounded-full',
                                        isLast && 'invisible',
                                        !isLast && (rightAccent ? 'bg-(--c-accent)' : 'bg-(--c-border)'),
                                    )}
                                />
                            </div>
                            <span
                                className={cn(
                                    'mt-1.5 block text-center text-xs font-medium sm:text-sm',
                                    step.state === 'pending' ? 'text-(--c-text-muted)' : 'text-(--c-text)',
                                )}
                            >
                                {step.label}
                            </span>
                            <span className="mt-0.5 block text-center text-[11px] text-(--c-text-muted)">
                                {subtextFor(step)}
                            </span>
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
