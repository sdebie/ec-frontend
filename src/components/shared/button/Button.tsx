import * as React from 'react';
import {cn} from '@/utils/cn.ts';
import {Loader2} from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'solid' | 'ghost' | 'plain';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'solid',
            size = 'md',
            loading = false,
            disabled,
            leftIcon,
            rightIcon,
            fullWidth,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-admin-bg disabled:opacity-50 disabled:pointer-events-none';

        const variants = {
            solid: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
            ghost: 'text-admin-text hover:bg-admin-bg hover:text-primary',
            plain: 'text-admin-text-muted hover:text-admin-text bg-transparent underline-offset-4 hover:underline',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs',
            md: 'h-10 px-4 py-2 text-sm',
            lg: 'h-12 px-6 py-3 text-base',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth ? 'w-full' : '',
                    className
                )}
                {...props}
            >
                {loading &&
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                }
                {!loading && leftIcon &&
                    <span className="mr-2 inline-flex">
                        {leftIcon}
                    </span>
                }
                {children}
                {!loading && rightIcon &&
                    <span className="ml-2 inline-flex">
                        {rightIcon}
                    </span>
                }
            </button>
        );
    }
);

Button.displayName = 'Button';