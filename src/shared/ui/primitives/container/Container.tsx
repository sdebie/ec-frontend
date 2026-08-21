import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/utils/cn'

const containerVariants = cva('w-full', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[100rem]',
    },
    padded: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { size: 'sm', padded: true, class: 'px-4' },
    { size: 'md', padded: true, class: 'px-6' },
    { size: 'lg', padded: true, class: 'px-8' },
  ],
  defaultVariants: {
    size: 'md',
    padded: true,
  },
})

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padded, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ size, padded }), 'mx-auto', className)}
      {...props}
    />
  )
)
Container.displayName = 'Container'
