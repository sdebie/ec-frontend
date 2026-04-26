import * as React from 'react';
import { cn } from '@/utils/cn';

interface SfTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

/**
 * Storefront-safe textarea.
 * Uses --sf-* tokens; never uses admin-* tokens.
 *
 * Does NOT include px/py — pass via className.
 * Defaults to bg-(--sf-bg) so the textarea contrasts with a bg-(--sf-panel) card.
 * Example: <SfTextarea rows={5} placeholder="Your message..." className="px-4 py-2.5 text-xs" />
 */
export const SfTextarea = React.forwardRef<HTMLTextAreaElement, SfTextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
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

SfTextarea.displayName = 'SfTextarea';

