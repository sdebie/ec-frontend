import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/utils/cn.ts';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center font-medium transition-colors',
    'rounded-(--c-radius)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)',
    'focus-visible:ring-offset-1 focus-visible:ring-offset-(--c-bg)',
    'disabled:opacity-50 disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      variant: {
        solid:
          'bg-(--c-accent) text-(--c-accent-text) hover:bg-(--c-accent-hover) shadow-[var(--c-shadow-sm)]',
        secondary:
          'border border-(--c-border) bg-(--c-panel) text-(--c-text) ' +
          'hover:border-(--c-accent) hover:text-(--c-accent) shadow-[var(--c-shadow-sm)]',
        outline:
          'border border-(--c-border) bg-transparent text-(--c-text) ' +
          'hover:bg-(--c-bg) hover:border-(--c-accent) hover:text-(--c-accent)',
        ghost:
          'text-(--c-text) hover:bg-(--c-bg) hover:text-(--c-accent)',
        plain:
          'text-(--c-text-muted) bg-transparent hover:text-(--c-text) underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-(--c-control-h-sm) px-3 text-xs',
        md: 'h-(--c-control-h-md) px-4 text-sm',
        lg: 'h-(--c-control-h-lg) px-6 text-base',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, fullWidth, loading, disabled, leftIcon, rightIcon, children, ...rest },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...rest}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  )
);
Button.displayName = 'Button';
