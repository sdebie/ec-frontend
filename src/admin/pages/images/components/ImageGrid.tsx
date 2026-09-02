import {useState} from 'react'
import {ImageIcon} from 'lucide-react'
import {thumbnailUrl} from '@/shared/utils/imageUrl'
import {Button, Skeleton} from '@/shared/ui/primitives'

interface ImageGridProps {
    images: string[]
    isLoading: boolean
    hasNextPage?: boolean
    isFetchingNextPage: boolean
    onLoadMore: () => void
    onPreview: (filename: string) => void
}

export function ImageGrid({images, isLoading, hasNextPage, isFetchingNextPage, onLoadMore, onPreview}: ImageGridProps) {
    if (isLoading && images.length === 0) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {Array.from({length: 16})
                    .map((_, i) => (
                        <div key={i}>
                            <Skeleton.Rect className="aspect-square" />
                            <Skeleton.Bar height="h-3" width="w-3/4" className="mt-1.5" />
                        </div>
                    ))}
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {images.map((filename) => (
                    <button
                        key={filename}
                        type="button"
                        onClick={() => onPreview(filename)}
                        className="group text-left focus:outline-none focus:ring-2 focus:ring-(--c-ring) rounded-lg"
                    >
                        <div
                            className="aspect-square overflow-hidden rounded-lg border border-(--c-border) bg-(--c-surface)">
                            <ImageCell filename={filename}/>
                        </div>
                        <p className="mt-1 text-xs text-(--c-text-muted) truncate">
                            {filename}
                        </p>
                    </button>
                ))}
            </div>

            {hasNextPage && (
                <div className="flex justify-center pt-4">
                    <Button variant="ghost" size="md" onClick={onLoadMore} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Loading...' : 'Load more'}
                    </Button>
                </div>
            )}

            {!isLoading && images.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-(--c-text-muted)">
                    <ImageIcon className="h-12 w-12 mb-3 opacity-40"/>
                    <p className="text-sm">
                        No images found
                    </p>
                </div>
            )}
        </>
    )
}

function ImageCell({filename}: { filename: string }) {
    const [hasError, setHasError] = useState(false)

    if (hasError) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-(--c-surface)">
                <ImageIcon
                    className="h-8 w-8 text-(--c-text-muted) opacity-50"
                />
            </div>
        )
    }

    return (
        <img
            src={thumbnailUrl(filename)}
            alt={filename}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setHasError(true)}
        />
    )
}
