import {cn} from '@/shared/utils/cn'
import type {ReactNode} from 'react'

export interface SectionProps {
    variant?: 'light' | 'dark'
    width?: 'narrow' | 'default' | 'wide'
    /**
     * Rendered element. Defaults to `section` for the stacked page bands this
     * was built for; pages that adopt the same rhythm pass `main` so the
     * document keeps one top-level landmark.
     */
    as?: 'section' | 'main' | 'div'
    className?: string
    children: ReactNode
}

const widthMap: Record<NonNullable<SectionProps['width']>, string> = {
    narrow: 'max-w-2xl',
    default: 'max-w-5xl',
    wide: 'max-w-7xl',
}

/**
 * Shared section frame — standardized rhythm, container width, and light/dark variant.
 *
 * Dark variant uses a near-black base with a radial accent glow derived from --sf-accent.
 * The #121212 base is a documented theme-law exception (same family as bg-black/50 overlays
 * and hero darkStyle). Dark text treatment is scoped to [data-variant="dark"] via the
 * component's own CSS — consumers never hand-pick dark classes.
 */
export function Section({
                            variant = 'light',
                            width = 'default',
                            as = 'section',
                            className,
                            children,
                        }: SectionProps) {
    const isDark = variant === 'dark'
    const Tag = as

    return (
        <Tag
            data-variant={isDark ? 'dark' : undefined}
            className={cn('py-12 px-6 sm:px-8', className)}
            style={
                isDark
                    ? {
                        background: 'radial-gradient(120% 100% at 85% 0%, color-mix(in srgb, var(--sf-accent) 28%, transparent), transparent 55%), #121212',
                        color: 'rgba(255, 255, 255, 0.92)',
                    }
                    : undefined
            }
        >
            <div className={cn('mx-auto', widthMap[width])}>
                {children}
            </div>
        </Tag>
    )
}
