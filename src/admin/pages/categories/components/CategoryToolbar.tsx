import {Button} from '@/shared/ui/primitives'
import {CategorySearchInput} from './CategorySearchInput'

interface CategoryToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void
    canMutate: boolean
    onCreateCategory: () => void
}

export function CategoryToolbar({searchValue, onSearchChange, canMutate, onCreateCategory}: CategoryToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CategorySearchInput value={searchValue} onChange={onSearchChange}/>
            {canMutate && (
                <Button
                    variant="solid"
                    onClick={onCreateCategory}
                    className="w-full sm:w-auto"
                >
                    + New Category
                </Button>
            )}
        </div>
    )
}
