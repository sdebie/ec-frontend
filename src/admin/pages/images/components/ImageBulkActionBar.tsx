import {Button} from '@/shared/ui/primitives'

interface ImageBulkActionBarProps {
    selectedCount: number
    onDelete: () => void
    onClear: () => void
    isDeleting: boolean
}

export function ImageBulkActionBar({selectedCount, onDelete, onClear, isDeleting}: ImageBulkActionBarProps) {
    return (
        <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) px-4 py-2">
            <span className="text-sm font-medium text-(--c-text)">
                {selectedCount} selected
            </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="md"
                    disabled={isDeleting}
                    onClick={onDelete}
                    data-testid="bulk-delete-images"
                >
                    Delete selected
                </Button>
                <Button
                    variant="ghost"
                    size="md"
                    onClick={onClear}
                >
                    Clear
                </Button>
            </div>
        </div>
    )
}
