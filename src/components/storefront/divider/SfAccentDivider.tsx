import { cn } from '@/utils/cn';

interface SfAccentDividerProps {
    className?: string;
}

/**
 * Storefront accent divider bar.
 * Uses --sf-* tokens; never uses admin-* tokens.
 *
 * Height (h-1) and rounding are fixed. Width defaults to w-12.
 * Pass width and margin via className.
 * Example: <SfAccentDivider className="w-15 mt-2 mb-5" />
 */
export function SfAccentDivider({ className }: SfAccentDividerProps) {
    return (
        <div className={cn('h-1 w-12 rounded bg-(--sf-accent)', className)} />
    );
}

