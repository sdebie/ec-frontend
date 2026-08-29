import {Ban, CheckCircle, Clock, Package} from 'lucide-react'
import * as React from 'react'

import {useProductStats} from '../hooks/useProductStats'
import type {ProductStats} from '../types'
import {Skeleton} from '@/shared/ui/primitives'

export function getStatCardSubtitle(cardCount: number, total: number, isTotal: boolean): string {
    if (isTotal) return 'View all products'
    if (total === 0) return '0% of total'
    return `${Math.round((cardCount / total) * 100)}% of total`
}

interface StatCardConfig {
    key: string
    label: string
    icon: React.ReactNode
    colorText: string
    iconColorClass: string
    getValue: (stats: ProductStats) => number
    isTotal: boolean
}

const STAT_CARD_CONFIGS: StatCardConfig[] = [
    {
        key: 'total',
        label: 'Total Products',
        icon: <Package className="h-5 w-5"/>,
        colorText: 'text-(--primary)',
        iconColorClass: 'text-(--primary) bg-(--primary-subtle)',
        getValue: (stats) => stats.total,
        isTotal: true,
    },
    {
        key: 'active',
        label: 'Active',
        icon: <CheckCircle className="h-5 w-5"/>,
        colorText: 'text-[var(--admin-status-green-text)]',
        iconColorClass: 'text-[var(--admin-status-green-text)] bg-[var(--admin-status-green-bg)]',
        getValue: (stats) => stats.active,
        isTotal: false,
    },
    {
        key: 'pending',
        label: 'Pending',
        icon: <Clock className="h-5 w-5"/>,
        colorText: 'text-[var(--admin-status-yellow-text)]',
        iconColorClass: 'text-[var(--admin-status-yellow-text)] bg-[var(--admin-status-yellow-bg)]',
        getValue: (stats) => stats.pending,
        isTotal: false,
    },
    {
        key: 'disabled',
        label: 'Disabled',
        icon: <Ban className="h-5 w-5"/>,
        colorText: 'text-[var(--admin-status-red-text)]',
        iconColorClass: 'text-[var(--admin-status-red-text)] bg-[var(--admin-status-red-bg)]',
        getValue: (stats) => stats.disabled,
        isTotal: false,
    },
]

function StatCardSkeleton() {
    return (
        <div className="bg-(--c-panel) border border-(--c-border) p-6 rounded-xl">
            <div className="flex items-center gap-4">
                <Skeleton.Rect className="h-12 w-12 shrink-0"/>
                <div className="space-y-2 flex-1">
                    <Skeleton.Bar height="h-7" width="w-12"/>
                    <Skeleton.Bar height="h-3" width="w-20"/>
                    <Skeleton.Bar height="h-3" width="w-24"/>
                </div>
            </div>
        </div>
    )
}

export function ProductStatCards() {
    const {data: stats, isLoading, isError} = useProductStats()

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARD_CONFIGS.map((config) => (
                    <StatCardSkeleton key={config.key}/>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARD_CONFIGS.map((config) => {
                const count = isError || !stats ? undefined : config.getValue(stats)
                const total = stats?.total ?? 0
                const displayValue = count !== undefined ? String(count) : '—'
                const subtitle = count !== undefined
                    ? getStatCardSubtitle(count, total, config.isTotal)
                    : ''

                return (
                    <div
                        key={config.key}
                        className="bg-(--c-panel) border border-(--c-border) p-6 rounded-xl shadow-(--c-shadow-sm)"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg shrink-0 ${config.iconColorClass}`}>
                                {config.icon}
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-(--c-text) tracking-tight">
                                    {displayValue}
                                </div>
                                <p className="text-sm font-medium text-(--c-text-muted)">{config.label}</p>
                                {subtitle && (
                                    <p className={`mt-0.5 text-xs ${config.colorText}`}>{subtitle}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
