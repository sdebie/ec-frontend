import * as React from 'react'
import { cn } from '@/shared/utils/cn'

const colorTokens: Record<string, string> = {
  gray: 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text)',
  yellow: 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text)',
  green: 'bg-(--c-status-green-bg) text-(--c-status-green-text)',
  blue: 'bg-(--c-status-green-bg) text-(--c-status-green-text)',
  red: 'bg-(--c-status-red-bg) text-(--c-status-red-text)',
  orange: 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text)',
}

const neutralClasses = 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text)'

export interface StatusBadgeProps {
  label: string
  color: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorTokens[color] ?? neutralClasses,
        className,
      )}
    >
      {label}
    </span>
  )
}
