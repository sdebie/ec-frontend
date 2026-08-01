import {Check} from 'lucide-react'
import {cn} from '@/shared/utils/cn'

export interface StepperStep {
    id: string
    label: string
}

export interface StepperProps {
    steps: StepperStep[]
    /** Zero-based index of the active step. */
    activeStep: number
    /**
     * Called with the step index when a COMPLETED (earlier) step is clicked.
     * Later steps are never clickable — forward navigation belongs to the
     * consumer's own controls (typically a validating "Next" button).
     */
    onStepClick?: (index: number) => void
    className?: string
}

/**
 * Horizontal progress stepper for multi-step flows.
 *
 * Every step owns an equal flex cell with its circle centred and a
 * half-connector on each side, so connector lengths stay uniform no matter
 * how wide a step's label is.
 *
 * Colours use --c-* tokens only, so it themes correctly on both surfaces:
 * under [data-surface="storefront"] the tokens remap onto the client's
 * --sf-* branding; on admin they resolve to the admin palette.
 */
export function Stepper({steps, activeStep, onStepClick, className}: StepperProps) {
    return (
        <nav aria-label="Progress" className={className}>
            <ol className="flex w-full">
                {steps.map((step, index) => {
                    const isCompleted = index < activeStep
                    const isActive = index === activeStep
                    const isClickable = isCompleted && !!onStepClick

                    const circle = (
                        <span
                            aria-hidden="true"
                            className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                                isCompleted && 'bg-(--c-accent) text-(--c-accent-text)',
                                isActive && 'border-2 border-(--c-accent) bg-(--c-panel) text-(--c-accent)',
                                !isCompleted && !isActive && 'border border-(--c-border) bg-(--c-panel) text-(--c-text-muted)',
                            )}
                        >
                            {isCompleted ? <Check className="h-4 w-4"/> : index + 1}
                        </span>
                    )

                    // Half-connectors: the left one joins the previous circle (reached when
                    // this step is), the right one joins the next (reached once this step
                    // is completed). Edge cells keep an invisible spacer so circles align.
                    const leftSegment = (
                        <span
                            aria-hidden="true"
                            className={cn(
                                'h-0.5 flex-1 rounded-full',
                                index === 0 && 'invisible',
                                index > 0 && (isCompleted || isActive ? 'bg-(--c-accent)' : 'bg-(--c-border)'),
                            )}
                        />
                    )
                    const rightSegment = (
                        <span
                            aria-hidden="true"
                            className={cn(
                                'h-0.5 flex-1 rounded-full',
                                index === steps.length - 1 && 'invisible',
                                index < steps.length - 1 && (isCompleted ? 'bg-(--c-accent)' : 'bg-(--c-border)'),
                            )}
                        />
                    )

                    const label = (
                        <span
                            className={cn(
                                'mt-1.5 block text-center text-xs font-medium sm:text-sm',
                                isActive || isCompleted ? 'text-(--c-text)' : 'text-(--c-text-muted)',
                            )}
                        >
                            {step.label}
                        </span>
                    )

                    return (
                        <li key={step.id} aria-current={isActive ? 'step' : undefined} className="flex-1">
                            <div className="flex items-center gap-1">
                                {leftSegment}
                                {isClickable ? (
                                    <button
                                        type="button"
                                        aria-label={step.label}
                                        onClick={() => onStepClick(index)}
                                        className="cursor-pointer"
                                    >
                                        {circle}
                                    </button>
                                ) : circle}
                                {rightSegment}
                            </div>
                            {label}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
