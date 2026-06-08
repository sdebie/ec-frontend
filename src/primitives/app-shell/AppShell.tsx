import * as React from 'react';
import {cn} from '@/utils/cn.ts';

/**
 * AppShell — outermost page wrapper shared by the admin portal and storefront.
 *
 * Provides `min-h-screen flex flex-col` so that:
 *  - The page always fills the viewport height.
 *  - A `flex-1` child (the main content area) grows to push the footer to the bottom.
 *
 * Background and text colours are intentionally NOT applied here — each surface
 * (admin/storefront) passes its own colour tokens via `className`.
 *
 * Rules (same as all primitives/):
 *  - No business logic, no API calls, no routing.
 *  - Structural only — callers own colour and surface tokens.
 */
export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
    ({children, className, ...props}, ref) => (
        <div
            ref={ref}
            className={cn('min-h-screen flex flex-col', className)}
            {...props}
        >
            {children}
        </div>
    ),
);
AppShell.displayName = 'AppShell';
