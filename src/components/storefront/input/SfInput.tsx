import * as React from 'react';
import { cn } from '@/utils/cn';

interface SfInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

/**
 * Storefront-safe text input.
 * Uses --sf-* tokens; never uses admin-* tokens.
 *
 * Does NOT include px/py — pass via className.
 * Defaults to bg-(--sf-bg) so the input contrasts with a bg-(--sf-panel) card.
 * Example: <SfInput type="text" placeholder="Search…" className="px-3 py-2 text-sm" />
 */
export const SfInput = React.forwardRef<HTMLInputElement, SfInputProps>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    'w-full rounded-lg border border-(--sf-border) bg-(--sf-bg) text-(--sf-text)',
                    'placeholder:text-(--sf-muted-text)',
                    'focus:outline-none focus:ring-2 focus:ring-(--sf-accent)',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            />
        );
    }
);

SfInput.displayName = 'SfInput';

