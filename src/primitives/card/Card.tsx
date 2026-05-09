import * as React from 'react';

import {cn} from '@/utils/cn.ts';

type CardElement = 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer';
type CardElevation = 'none' | 'sm';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
    as?: CardElement;
    bordered?: boolean;
    padded?: boolean;
    elevation?: CardElevation;
}

const CardRoot = React.forwardRef<HTMLElement, CardProps>(
    (
        {as = 'div', bordered = true, padded = true, elevation = 'sm', className, ...props},
        ref
    ) => {
        const Component = as as React.ElementType;
        return (
            <Component
                ref={ref as React.Ref<HTMLElement>}
                className={cn(
                    'bg-(--c-panel) text-(--c-text) rounded-(--c-radius)',
                    bordered && 'border border-(--c-border)',
                    padded && 'p-4',
                    elevation === 'sm' && 'shadow-[var(--c-shadow-sm)]',
                    className
                )}
                {...(props as React.HTMLAttributes<HTMLElement>)}
            />
        );
    }
);
CardRoot.displayName = 'Card';

const CardHeader = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('mb-3 pb-3 border-b border-(--c-border) font-semibold', className)} {...props} />
);

const CardBody = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn(className)} {...props} />
);

const CardFooter = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('mt-3 pt-3 border-t border-(--c-border)', className)} {...props} />
);

export const Card = Object.assign(CardRoot, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
});
