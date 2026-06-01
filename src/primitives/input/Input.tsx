import {cva, type VariantProps} from 'class-variance-authority';
import * as React from 'react';
import {cn} from '@/utils/cn.ts';

const inputVariants = cva(
    [
        'w-full rounded-(--c-radius) border bg-(--c-panel) text-(--c-text)',
        'placeholder:text-(--c-text-muted)',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)',
        'focus-visible:ring-offset-1 focus-visible:ring-offset-(--c-bg)',
        'disabled:cursor-not-allowed disabled:opacity-50',
    ].join(' '),
    {
        variants: {
            variant: {
                default: 'border-(--c-border)',
                error: 'border-red-500 focus-visible:ring-red-500',
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
);

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
);
Input.displayName = 'Input';
