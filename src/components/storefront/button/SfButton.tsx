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
                    'rounded-[calc(var(--sf-radius)-0.25rem)] bg-(--sf-accent) text-(--sf-accent-text) font-semibold',
                    'transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[var(--sf-shadow-sm)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--sf-ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--sf-panel)',
                    'disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0',
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

