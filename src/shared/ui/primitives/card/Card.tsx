import * as React from 'react'
import {cva} from 'class-variance-authority'
import {cn} from '@/shared/utils/cn'

type CardElement = 'div' | 'section' | 'article' | 'aside' | 'main' | 'header' | 'footer'

const cardVariants = cva('text-(--c-text) rounded-(--c-radius)', {
    variants: {
        variant: {
            panel: 'bg-(--c-panel) shadow-(--c-shadow-sm)',
            bordered: 'bg-(--c-panel) border border-(--c-border)',
            plain: '',
        },
        clickable: {
            true: 'cursor-pointer',
            false: '',
        },
    },
    defaultVariants: {
        variant: 'panel',
        clickable: false,
    },
})

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
    as?: CardElement
    variant?: 'panel' | 'bordered' | 'plain'
    clickable?: boolean
    onClick?: (e: React.MouseEvent) => void
}

const CardRoot = React.forwardRef<HTMLElement, CardProps>(
    ({as = 'div', variant = 'panel', clickable = false, className, onClick, ...props}, ref) => {
        const Component = as as React.ElementType
        return (
            <Component
                ref={ref as React.Ref<HTMLElement>}
                className={cn(
                    cardVariants({variant, clickable}),
                    className
                )}
                onClick={onClick}
                {...(props as React.HTMLAttributes<HTMLElement>)}
            />
        )
    }
)
CardRoot.displayName = 'Card'

const CardHeader = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('mb-3 pb-3 border-b border-(--c-border) font-semibold', className)} {...props} />
)

const CardBody = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn(className)} {...props} />
)

const CardFooter = ({className, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('mt-3 pt-3 border-t border-(--c-border)', className)} {...props} />
)

export const Card = Object.assign(CardRoot, {
    Header: CardHeader,
    Body: CardBody,
    Footer: CardFooter,
})
