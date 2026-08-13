import {cva, type VariantProps} from 'class-variance-authority'
import * as React from 'react'
import {cn} from '@/shared/utils/cn'

const inputVariants = cva(
    [
        'w-full rounded-(--c-radius) border bg-(--c-panel) text-(--c-text)',
        'placeholder:text-(--c-text-muted)',
        'focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
    ].join(' '),
    {
        variants: {
            variant: {
                default: 'border-(--c-border) focus-visible:border-(--c-accent)',
                error: 'border-(--c-error)',
            },
            size: {
                sm: 'h-(--c-control-h-sm) px-3 text-xs',
                md: 'h-(--c-control-h-md) px-4 text-sm',
                lg: 'h-(--c-control-h-lg) px-5 text-base',
            },
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
