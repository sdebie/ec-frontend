import {cva, type VariantProps} from 'class-variance-authority'
import * as React from 'react'
import {cn} from '@/shared/utils/cn'
import {CONTROL_SIZE_CLASSES} from '@/shared/ui/primitives/controlSize'

const inputVariants = cva(
    [
        'w-full rounded-(--c-radius) border bg-(--c-input-bg) text-(--c-text)',
        'placeholder:text-(--c-text-muted)',
        'focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
    ].join(' '),
    {
        variants: {
            variant: {
                default:
                    'border-(--c-input-border) not-read-only:hover:border-(--c-input-hover-border) not-read-only:focus-visible:border-(--c-accent)',
                error: 'border-(--c-error)',
            },
            size: CONTROL_SIZE_CLASSES,
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
)

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
        VariantProps<typeof inputVariants> {
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({className, variant, size, type = 'text', ...props}, ref) => (
        <input
            type={type}
            className={cn(inputVariants({variant, size}), className)}
            ref={ref}
            {...props}
        />
    )
)
Input.displayName = 'Input'
