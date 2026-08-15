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
            // The secondary surface, not the page background: this sits inside a panel
            // or a table row, so painting it the page colour leaves it with almost no
            // presence against white. Text is the secondary tone rather than muted —
            // initials are the content here, not a caption.
            className={cn(sizeClasses[size],
                'rounded-md bg-(--c-panel-secondary) border border-(--c-border) flex items-center justify-center font-semibold text-(--c-text-secondary) select-none',
                className
            )}
        >
            {initials}
        </div>
    )
}

Thumbnail.displayName = 'Thumbnail'
