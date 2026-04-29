import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SfIconBoxProps {
    children: ReactNode;
    className?: string;
}

/**
 * Storefront icon container box.
 * Uses --sf-* tokens; never uses admin-* tokens.
 *
 * Provides a tinted rounded background with the accent colour applied to
 * the child icon via CSS inheritance (text-* on parent, currentColor on SVG).
 * Example: <SfIconBox><Phone size={20} /></SfIconBox>
 */
export function SfIconBox({ children, className }: SfIconBoxProps) {
    return (
        <div className={cn('p-3 rounded-lg bg-(--sf-bg) text-(--sf-accent)', className)}>
            {children}
        </div>
    );
}

