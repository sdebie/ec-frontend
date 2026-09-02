import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

export interface IconTextProps {
  icon: ReactNode
  children: ReactNode
  as?: React.ElementType
  className?: string
}

export function IconText({ icon, children, as: Component = 'span', className }: IconTextProps) {
  return (
    <Component className={cn('inline-flex items-center gap-2', className)}>
      <span className="shrink-0">{icon}</span>
      {children}
    </Component>
  )
}
