import {useState} from 'react'
import {cn} from '@/shared/utils/cn'
import {resolveImageUrl} from '@/shared/utils/imageUrl'

export type ThumbnailSize = 'sm' | 'md' | 'lg'

export interface ThumbnailProps {
    logoUrl?: string | null
    name: string
    size?: ThumbnailSize
    className?: string
}

const sizeClasses: Record<ThumbnailSize, string> = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
}

export function Thumbnail({logoUrl, name, size = 'md', className}: ThumbnailProps) {
    const [imgError, setImgError] = useState(false)
    const initials = name?.slice(0, 2).toUpperCase() ?? '?'
    // Law 7: storage-relative DB paths must resolve to /static/images/…; idempotent for absolute URLs.
    const resolvedUrl = resolveImageUrl(logoUrl)

    if (resolvedUrl && !imgError) {
        return (
            <img
                src={resolvedUrl}
                alt={`${name} logo`}
                // Fixed white backing, not a theme token: most uploaded logos are dark
                // artwork on a transparent background, drawn for a light page — on
                // --c-bg in dark mode they'd blend in and disappear entirely.
                className={cn(
                    sizeClasses[size],
                    'rounded-md object-contain bg-white border border-(--c-border)',
                    className
                )}
                onError={() => setImgError(true)}
            />
        )
    }

    return (
        <div
            className={cn(sizeClasses[size],
                'rounded-md bg-(--c-bg) border border-(--c-border) flex items-center justify-center font-semibold text-(--c-text-muted) select-none',
                className
            )}
        >
            {initials}
        </div>
    )
}

Thumbnail.displayName = 'Thumbnail'
