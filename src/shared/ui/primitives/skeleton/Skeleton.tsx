import { cn } from '@/shared/utils/cn'

export interface SkeletonBarProps {
  width?: string
  height?: string
  className?: string
}

export function SkeletonBar({ width, height = 'h-4', className }: SkeletonBarProps) {
  return <div className={cn('rounded bg-(--c-border) animate-pulse', height, width, className)} />
}

export interface SkeletonCircleProps {
  size?: string
  className?: string
}

export function SkeletonCircle({ size = 'h-10 w-10', className }: SkeletonCircleProps) {
  return <div className={cn('rounded-full bg-(--c-border) animate-pulse', size, className)} />
}

export interface SkeletonRectProps {
  className?: string
}

export function SkeletonRect({ className }: SkeletonRectProps) {
  return <div className={cn('rounded-lg bg-(--c-border) animate-pulse', className)} />
}

export const Skeleton = { Bar: SkeletonBar, Circle: SkeletonCircle, Rect: SkeletonRect }
