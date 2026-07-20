import type { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'
import { SurfaceProvider, type SurfaceElevation, type Density } from './SurfaceContext'

export interface SurfaceProps {
  elevation: SurfaceElevation
  density?: Density
  className?: string
  children: ReactNode
}

export function Surface({
  elevation,
  density = 'comfortable',
  className,
  children,
}: SurfaceProps) {
  return (
    <SurfaceProvider elevation={elevation} density={density}>
      <div
        data-surface={elevation}
        data-density={density}
        className={cn('contents', className)}
      >
        {children}
      </div>
    </SurfaceProvider>
  )
}
