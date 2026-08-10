import {GripVertical, ImageIcon, ImagePlus, LayoutGrid, List, Pin, RefreshCw, Trash2, UploadCloud, X} from 'lucide-react'
import * as React from 'react'
import {cn} from '@/shared/utils/cn'
import {Textarea} from '../form/Textarea'

export interface ImageGalleryItem {
    /** Stored path (e.g. storage-relative) — the image's identity. */
    url: string
    altText?: string
}

export interface ImageGalleryManagerProps {
    /**
     * Items in display order. The FIRST entry is the primary image —
     * reordering is how a consumer changes which image is primary.
     */
    images: ImageGalleryItem[]
    /** Called with every file picked or dropped — caller owns the API calls. */
    onUpload: (files: File[]) => void
    /** Remove an image by its stored value. */
    onRemove: (value: string) => void
    /** Receives the full list in its new order after a drag or set-primary. */
    onReorder: (nextImages: ImageGalleryItem[]) => void
    /** Enables the alt-text field in the details panel. */
    onAltTextChange?: (value: string, altText: string) => void
    /** Enables "Replace file" in the details panel. */
    onReplace?: (value: string, file: File) => void
    /**
     * Maps a stored value to a displayable URL (e.g. resolveImageUrl for
     * storage-relative paths). Defaults to using the value as-is.
     */
    resolveSrc?: (value: string) => string | null
    label?: string
    /** Muted helper line rendered under the label. */
    description?: string
    /** When set, shows "n of max" and blocks adding beyond it. */
    maxImages?: number
    disabled?: boolean
    className?: string
}

function fileNameOf(value: string): string {
    return value.split('/').pop() || value
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    return next
}

interface ItemActionsProps {
    fileName: string
    isPrimary: boolean
    disabled: boolean
    onSetPrimary: () => void
    onRemove: () => void
}

/** Pin + remove buttons, shared by the grid card and the row layouts. */
function ItemActions({fileName, isPrimary, disabled, onSetPrimary, onRemove}: ItemActionsProps) {
    const buttonClass = 'rounded-md p-1 text-(--c-text-muted) transition-colors hover:bg-(--c-bg) hover:text-(--c-text) disabled:pointer-events-none disabled:opacity-40'
    return (
        <>
            {!isPrimary && (
                <button
                    type="button"
                    onClick={onSetPrimary}
                    disabled={disabled}
                    aria-label={`Set ${fileName} as primary image`}
                    title="Set as primary"
                    className={buttonClass}
                >
                    <Pin className="h-3.5 w-3.5" aria-hidden="true"/>
                </button>
            )}
            <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                aria-label={`Remove image ${fileName}`}
                className={buttonClass}
            >
                <X className="h-3.5 w-3.5" aria-hidden="true"/>
            </button>
        </>
    )
}

const PRIMARY_BADGE_CLASS = 'rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase'

interface ImageDetailsPanelProps {
    item: ImageGalleryItem
    isPrimary: boolean
    src: string | null
    disabled: boolean
    onClose: () => void
    onSetPrimary: () => void
    onRemove: () => void
    onAltTextChange?: (altText: string) => void
    onReplace?: (file: File) => void
}

function ImageDetailsPanel({
    item,
    isPrimary,
    src,
    disabled,
    onClose,
    onSetPrimary,
    onRemove,
    onAltTextChange,
    onReplace,
}: ImageDetailsPanelProps) {
    const altFieldId = React.useId()
    const replaceInputRef = React.useRef<HTMLInputElement>(null)
    // Dimensions are read from the loaded image itself — they are not stored
    // anywhere, so they appear once the browser has the file. The panel is
    // keyed by the image URL, so this state resets with each selection.
    const [dimensions, setDimensions] = React.useState<{ w: number; h: number } | null>(null)
    const fileName = fileNameOf(item.url)

    const actionClass = 'flex w-full items-center gap-3 rounded-md border border-(--c-border) px-3 py-2 text-sm font-medium transition-colors hover:bg-(--c-surface-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring) disabled:cursor-not-allowed disabled:opacity-50'

    return (
        <div className="shrink-0 rounded-xl border border-(--c-border) bg-(--c-panel) p-4 lg:w-72">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-(--c-text-muted) uppercase">
                    Image details
                </span>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close image details"
                    className="rounded-md p-1 text-(--c-text-muted) transition-colors hover:bg-(--c-surface-hover) hover:text-(--c-text)"
                >
                    <X className="h-4 w-4" aria-hidden="true"/>
                </button>
            </div>

            <div className="mb-3 flex min-h-40 items-center justify-center rounded-lg bg-(--c-bg) p-2">
                {src ? (
                    <img
                        src={src}
                        alt={item.altText || fileName}
                        onLoad={(e) => {
                            const img = e.currentTarget
                            if (img.naturalWidth) setDimensions({w: img.naturalWidth, h: img.naturalHeight})
                        }}
                        className="max-h-56 max-w-full rounded-md object-contain"
                    />
                ) : (
                    <ImageIcon className="h-8 w-8 text-(--c-text-muted)" aria-hidden="true"/>
                )}
            </div>

            <p className="truncate text-sm font-medium text-(--c-text)" title={fileName}>{fileName}</p>
            {dimensions && (
                <p className="text-xs text-(--c-text-muted)">{dimensions.w} × {dimensions.h}</p>
            )}

            {onAltTextChange && (
                <div className="mt-4">
                    <label htmlFor={altFieldId} className="mb-1 block text-sm font-medium text-(--c-text)">
                        Alt text
                    </label>
                    <Textarea
                        id={altFieldId}
                        value={item.altText ?? ''}
                        onChange={(e) => onAltTextChange(e.target.value)}
                        placeholder="Describe the image for screen readers and search"
                        disabled={disabled}
                        rows={3}
                    />
                    <p className="mt-1 text-xs text-(--c-text-muted)">
                        Used by screen readers and image search.
                    </p>
                </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
                <button
                    type="button"
                    onClick={onSetPrimary}
                    disabled={disabled || isPrimary}
                    className={cn(actionClass, 'text-(--c-text)')}
                >
                    <Pin className="h-4 w-4" aria-hidden="true"/>
                    {isPrimary ? 'Primary image' : 'Set as primary'}
                </button>

                {onReplace && (
                    <>
                        <input
                            ref={replaceInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            aria-label="Replace image file"
                            disabled={disabled}
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) onReplace(file)
                                if (replaceInputRef.current) replaceInputRef.current.value = ''
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => replaceInputRef.current?.click()}
                            disabled={disabled}
                            className={cn(actionClass, 'text-(--c-text)')}
                        >
                            <RefreshCw className="h-4 w-4" aria-hidden="true"/>
                            Replace file
                        </button>
                    </>
                )}

                <button
                    type="button"
                    onClick={onRemove}
                    disabled={disabled}
                    className={cn(actionClass, 'text-(--c-danger)')}
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true"/>
                    Remove image
                </button>
            </div>
        </div>
    )
}

/**
 * Multi-image gallery editor: add several files at once (picker or drop),
 * drag cards to reorder, promote any image to primary (position 0), and
 * edit per-image detail (alt text, replace, remove) in a side panel opened
 * by selecting a card. Persistence semantics stay with the consumer — this
 * component only reports value-level changes.
 */
export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
    images,
    onUpload,
    onRemove,
    onReorder,
    onAltTextChange,
    onReplace,
    resolveSrc = (value) => value,
    label,
    description,
    maxImages,
    disabled = false,
    className,
}) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [isFileDragOver, setIsFileDragOver] = React.useState(false)
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
    const [selectedValue, setSelectedValue] = React.useState<string | null>(null)
    const [layout, setLayout] = React.useState<'grid' | 'row'>('grid')

    // Selection follows the item, not the index — it survives reorders and
    // clears itself when the selected image is removed or replaced.
    const selectedIndex = images.findIndex((item) => item.url === selectedValue)
    const selectedItem = selectedIndex >= 0 ? images[selectedIndex] : null

    const atCapacity = maxImages !== undefined && images.length >= maxImages
    const canAdd = !disabled && !atCapacity

    const acceptFiles = (fileList: FileList | null) => {
        if (!canAdd || !fileList || fileList.length === 0) return
        let files = Array.from(fileList)
        if (maxImages !== undefined) {
            files = files.slice(0, Math.max(0, maxImages - images.length))
        }
        if (files.length > 0) onUpload(files)
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        acceptFiles(event.target.files)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // One drop surface for the whole grid. A drag carrying files is an upload;
    // anything else is a card reorder handled on the cards themselves.
    const isFileDrag = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes('Files')

    const handleGridDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isFileDrag(e)) return
        e.preventDefault()
        if (canAdd && !isFileDragOver) setIsFileDragOver(true)
    }

    const handleGridDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isFileDrag(e)) return
        e.preventDefault()
        setIsFileDragOver(false)
    }

    const handleGridDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isFileDrag(e)) return
        e.preventDefault()
        setIsFileDragOver(false)
        acceptFiles(e.dataTransfer.files)
    }

    const handleCardDrop = (targetIndex: number) => (e: React.DragEvent<HTMLDivElement>) => {
        if (isFileDrag(e)) return
        e.preventDefault()
        e.stopPropagation()
        if (draggedIndex === null || draggedIndex === targetIndex) return
        onReorder(moveItem(images, draggedIndex, targetIndex))
        setDraggedIndex(null)
    }

    const countLabel = maxImages !== undefined
        ? `${images.length} of ${maxImages} images`
        : `${images.length} ${images.length === 1 ? 'image' : 'images'}`

    return (
        <div className={cn('w-full', className)}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={!canAdd}
                className="hidden"
                aria-label="Upload image file"
            />

            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                {(label || description) && (
                    <div className="min-w-0">
                        {label && <span className="block text-sm font-medium text-(--c-text)">{label}</span>}
                        {description && (
                            <p className="mt-0.5 text-xs text-(--c-text-muted)">{description}</p>
                        )}
                    </div>
                )}
                <div className="ml-auto flex shrink-0 items-center gap-3">
                    <span className="text-xs text-(--c-text-muted)">{countLabel}</span>
                    <div className="inline-flex overflow-hidden rounded-md border border-(--c-border)" role="group" aria-label="Image layout">
                        <button
                            type="button"
                            onClick={() => setLayout('grid')}
                            aria-label="Grid view"
                            aria-pressed={layout === 'grid'}
                            className={cn(
                                'inline-flex items-center justify-center p-2 transition-colors',
                                layout === 'grid'
                                    ? 'bg-primary-subtle text-primary'
                                    : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" aria-hidden="true"/>
                        </button>
                        <button
                            type="button"
                            onClick={() => setLayout('row')}
                            aria-label="Row view"
                            aria-pressed={layout === 'row'}
                            className={cn(
                                'inline-flex items-center justify-center p-2 transition-colors',
                                layout === 'row'
                                    ? 'bg-primary-subtle text-primary'
                                    : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
                            )}
                        >
                            <List className="h-4 w-4" aria-hidden="true"/>
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => canAdd && fileInputRef.current?.click()}
                        disabled={!canAdd}
                        className="inline-flex items-center gap-2 rounded-md border border-(--c-border) px-3 py-1.5 text-sm font-medium text-(--c-text) transition-colors hover:bg-(--c-surface-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ImagePlus className="h-4 w-4" aria-hidden="true"/>
                        Add images
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div
                    onDragOver={handleGridDragOver}
                    onDragLeave={handleGridDragLeave}
                    onDrop={handleGridDrop}
                    data-layout={layout}
                    className={cn(
                        'flex-1',
                        layout === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3' : 'flex flex-col gap-2',
                    )}
                >
                    {images.map((item, index) => {
                        const src = resolveSrc(item.url)
                        const fileName = fileNameOf(item.url)
                        const isPrimary = index === 0
                        const isSelected = item.url === selectedValue
                        const dragProps = {
                            draggable: !disabled,
                            onDragStart: () => setDraggedIndex(index),
                            onDragEnd: () => setDraggedIndex(null),
                            onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
                                if (!isFileDrag(e)) e.preventDefault()
                            },
                            onDrop: handleCardDrop(index),
                        }
                        const borderClass = isSelected
                            ? 'border-(--c-accent) ring-1 ring-(--c-accent)'
                            : isPrimary ? 'border-(--c-accent)' : 'border-(--c-border)'
                        const itemActions = (
                            <ItemActions
                                fileName={fileName}
                                isPrimary={isPrimary}
                                disabled={disabled}
                                onSetPrimary={() => onReorder(moveItem(images, index, 0))}
                                onRemove={() => onRemove(item.url)}
                            />
                        )

                        if (layout === 'row') {
                            return (
                                <div
                                    key={item.url}
                                    {...dragProps}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border bg-(--c-panel) px-3 py-2',
                                        borderClass,
                                        draggedIndex === index && 'opacity-50',
                                        !disabled && 'cursor-grab',
                                    )}
                                >
                                    <GripVertical className="h-4 w-4 shrink-0 text-(--c-text-muted)" aria-hidden="true"/>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedValue(isSelected ? null : item.url)}
                                        aria-label={`Image details: ${fileName}`}
                                        aria-pressed={isSelected}
                                        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-(--c-bg) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)"
                                    >
                                        {src ? (
                                            <img
                                                src={src}
                                                alt={item.altText || fileName}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <ImageIcon className="h-5 w-5 text-(--c-text-muted)" aria-hidden="true"/>
                                        )}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-(--c-text)" title={fileName}>
                                            {fileName}
                                        </span>
                                        <span className="block truncate text-xs text-(--c-text-muted)">
                                            {item.altText || 'No alt text'}
                                        </span>
                                    </div>
                                    {isPrimary && <span className={cn('shrink-0', PRIMARY_BADGE_CLASS)}>Primary</span>}
                                    {itemActions}
                                </div>
                            )
                        }

                        return (
                            <div
                                key={item.url}
                                {...dragProps}
                                className={cn(
                                    'relative flex flex-col overflow-hidden rounded-xl border bg-(--c-panel)',
                                    borderClass,
                                    draggedIndex === index && 'opacity-50',
                                    !disabled && 'cursor-grab',
                                )}
                            >
                                {isPrimary && (
                                    <span className={cn('absolute top-2 left-2 z-10', PRIMARY_BADGE_CLASS)}>
                                        Primary
                                    </span>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setSelectedValue(isSelected ? null : item.url)}
                                    aria-label={`Image details: ${fileName}`}
                                    aria-pressed={isSelected}
                                    className="flex min-h-24 flex-1 items-center justify-center bg-(--c-bg) p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)"
                                >
                                    {src ? (
                                        <img
                                            src={src}
                                            alt={item.altText || fileName}
                                            className="max-h-32 max-w-full rounded-lg object-contain"
                                        />
                                    ) : (
                                        <ImageIcon className="h-6 w-6 text-(--c-text-muted)" aria-hidden="true"/>
                                    )}
                                </button>

                                <div className="flex items-center gap-1.5 border-t border-(--c-border) px-2 py-1.5">
                                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-(--c-text-muted)" aria-hidden="true"/>
                                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-(--c-text-muted)" title={fileName}>
                                        {fileName}
                                    </span>
                                    {itemActions}
                                </div>
                            </div>
                        )
                    })}

                    {canAdd && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    fileInputRef.current?.click()
                                }
                            }}
                            aria-label="Add or drop images"
                            className={cn(
                                'cursor-pointer rounded-xl border-2 border-dashed text-center transition-all outline-none',
                                layout === 'grid'
                                    ? 'flex min-h-32 flex-col items-center justify-center gap-2 p-4'
                                    : 'flex min-h-12 flex-row items-center justify-center gap-2 px-3 py-2',
                                isFileDragOver
                                    ? 'border-(--c-accent) bg-(--c-surface-hover)'
                                    : 'border-(--c-border) hover:border-(--c-accent) hover:bg-(--c-surface-hover) focus-visible:border-(--c-accent) focus-visible:ring-2 focus-visible:ring-(--c-ring)',
                            )}
                        >
                            <UploadCloud className="h-5 w-5 text-(--c-text-muted)" aria-hidden="true"/>
                            <span className="text-sm font-medium text-(--c-text)">
                                {isFileDragOver ? 'Drop to upload' : 'Add or drop images'}
                            </span>
                            <span className="text-xs text-(--c-text-muted)">PNG, JPG, GIF</span>
                        </div>
                    )}
                </div>

                {selectedItem && (
                    <ImageDetailsPanel
                        key={selectedItem.url}
                        item={selectedItem}
                        isPrimary={selectedIndex === 0}
                        src={resolveSrc(selectedItem.url)}
                        disabled={disabled}
                        onClose={() => setSelectedValue(null)}
                        onSetPrimary={() => onReorder(moveItem(images, selectedIndex, 0))}
                        onRemove={() => onRemove(selectedItem.url)}
                        onAltTextChange={onAltTextChange && ((altText) => onAltTextChange(selectedItem.url, altText))}
                        onReplace={onReplace && ((file) => onReplace(selectedItem.url, file))}
                    />
                )}
            </div>

            {images.length > 1 && !disabled && (
                <p className="mt-3 text-xs text-(--c-text-muted)">
                    Drag to reorder — the first image is the primary one.
                </p>
            )}
        </div>
    )
}
