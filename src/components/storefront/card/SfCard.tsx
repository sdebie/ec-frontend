import type { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react';
import { cn } from '@/utils/cn';

type SfCardOwnProps<T extends ElementType = 'div'> = {
    as?: T;
    elevation?: 'none' | 'sm';
    children: ReactNode;
    className?: string;
};

type SfCardProps<T extends ElementType = 'div'> = SfCardOwnProps<T> &
    Omit<ComponentPropsWithoutRef<T>, keyof SfCardOwnProps<T>>;

/**
 * Storefront-safe card surface.
 * Uses --sf-* tokens; never uses admin-* tokens.
 *
 * Does NOT include padding — pass it via className.
 * Elevation defaults to "none" to keep cards flat unless explicitly requested.
 * Example: <SfCard className="p-8 h-full order-2 lg:order-1">
 * Example: <SfCard as="aside" className="p-5 w-60">
 * Example: <SfCard elevation="sm" className="p-8">
 */
export function SfCard<T extends ElementType = 'div'>({
    as,
    elevation = 'none',
    children,
    className,
    ...rest
}: SfCardProps<T>) {
    const Tag = (as ?? 'div') as ElementType;
    const shadowClass = elevation === 'sm' ? 'shadow-[var(--sf-shadow-sm)]' : undefined;

    return (
        <Tag
            className={cn(
                'rounded-[var(--sf-radius)] border border-(--sf-border) bg-(--sf-panel) transition-shadow duration-200',
                shadowClass,
                className
            )}
            {...rest}
        >
            {children}
        </Tag>
    );
}

