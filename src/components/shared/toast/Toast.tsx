import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/utils/cn';

import { type ToastItem, useToastStore } from './toastStore';



// ─── Variant configuration ─────────────────────────────────────────────────────

type VariantConfig = {
    Icon: React.ElementType;
    iconClass: string;
    accentClass: string;
    /** ARIA live value — errors/warnings use assertive so screen readers interrupt */
    ariaLive: 'polite' | 'assertive';
};

const VARIANT_CONFIG: Record<ToastItem['variant'], VariantConfig> = {
    success: {
        Icon: CheckCircle2,
        iconClass: 'text-emerald-500',
        accentClass: 'bg-emerald-500',
        ariaLive: 'polite',
    },
    error: {
        Icon: XCircle,
        iconClass: 'text-red-500',
        accentClass: 'bg-red-500',
        ariaLive: 'assertive',
    },
    warning: {
        Icon: AlertTriangle,
        iconClass: 'text-amber-500',
        accentClass: 'bg-amber-500',
        ariaLive: 'assertive',
    },
    info: {
        Icon: Info,
        iconClass: 'text-blue-500',
        accentClass: 'bg-blue-500',
        ariaLive: 'polite',
    },
};

// ─── Toast item component ──────────────────────────────────────────────────────

export function Toast({ id, variant, title, message, duration }: ToastItem) {
    const remove = useToastStore((s) => s.remove);
    const { Icon, iconClass, accentClass, ariaLive } = VARIANT_CONFIG[variant];

    // Track enter/exit visibility for the CSS transition
    const [isVisible, setIsVisible] = React.useState(false);

    // Fire the enter animation on the next paint so the transition is visible
    React.useEffect(() => {
        const raf = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    const dismiss = React.useCallback(() => {
        setIsVisible(false);
        // Wait for the exit transition to finish before removing from the store
        setTimeout(() => remove(id), 300);
    }, [id, remove]);

    // Auto-dismiss
    React.useEffect(() => {
        if (duration === 0) return;
        const timer = setTimeout(dismiss, duration);
        return () => clearTimeout(timer);
    }, [dismiss, duration]);

    // Keyboard: pressing Escape dismisses the top-most toast that has focus
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                dismiss();
            }
        },
        [dismiss],
    );

    return (
        <div
            role="status"
            aria-live={ariaLive}
            aria-atomic="true"
            onKeyDown={handleKeyDown}
            className={cn(
                // Base card — mirrors the admin portal panel/card style
                'relative flex items-start w-80 rounded-xl border border-admin-border bg-admin-panel shadow-xl overflow-hidden',
                // Smooth enter (slide-in from right) + exit (slide-out to right)
                'transition-all duration-300 ease-in-out will-change-transform',
                isVisible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0',
            )}
        >
            {/* Coloured left accent strip — communicates variant at a glance */}
            <div
                className={cn('absolute left-0 inset-y-0 w-1', accentClass)}
                aria-hidden="true"
            />

            {/* Inner content */}
            <div className="flex items-start gap-3 px-4 py-3.5 pl-5 w-full min-w-0">
                {/* Variant icon */}
                <div className={cn('mt-0.5 shrink-0', iconClass)} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                </div>

                {/* Title + message */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <p className="text-sm font-semibold leading-tight text-admin-text mb-0.5">
                            {title}
                        </p>
                    )}
                    <p
                        className={cn(
                            'text-sm leading-snug',
                            title ? 'text-admin-text-muted' : 'text-admin-text',
                        )}
                    >
                        {message}
                    </p>
                </div>

                {/* Dismiss button */}
                <button
                    type="button"
                    onClick={dismiss}
                    className={cn(
                        'shrink-0 -mt-0.5 -mr-1 rounded-md p-1.5',
                        'opacity-60 transition-opacity hover:opacity-100',
                        'hover:bg-admin-sidebar-hover text-admin-text',
                        'focus:outline-none focus:ring-2 focus:ring-primary',
                        'focus:ring-offset-1 focus:ring-offset-admin-panel',
                    )}
                    aria-label="Dismiss notification"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

