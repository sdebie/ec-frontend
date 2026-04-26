import * as React from 'react';
import { cn } from '@/utils/cn';

interface SfButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
}

/**
 * Storefront-safe accent button.
 * Uses --sf-* tokens; never uses admin-* tokens.
 *
 * Does NOT include size (px/py/text-*) — pass via className.
 * Example: <SfButton className="px-8 py-2 text-xs flex items-center gap-2">
 */
export const SfButton = React.forwardRef<HTMLButtonElement, SfButtonProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'bg-(--sf-accent) text-(--sf-accent-text) rounded-lg font-semibold',
                    'transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed',
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

SfButton.displayName = 'SfButton';

