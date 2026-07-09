import { cn } from '@/shared/utils/cn'
import type { ReactNode } from 'react'

export interface StatCardProps {
  title: string
  value: string
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  className?: string
}

export function StatCard({ title, value, trend, trendDirection, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-(--c-panel) border border-(--c-border) p-6 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_0_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-(--c-text-muted) mb-1">{title}</p>
          <div className="text-2xl font-bold text-(--c-text) tracking-tight">{value}</div>

          {trend && (
            <div className="mt-2 flex items-center text-sm">
              <span
                className={cn(
                  'font-medium mr-2',
                  trendDirection === 'up' && 'text-(--c-success)',
                  trendDirection === 'down' && 'text-(--c-error)',
                  trendDirection === 'neutral' && 'text-(--c-text-muted)'
                )}
              >
                {trend}
              </span>
              <span className="text-(--c-text-muted)">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-(--c-accent)/10 text-(--c-accent) rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
