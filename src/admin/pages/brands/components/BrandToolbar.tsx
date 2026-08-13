import {Button} from '@/shared/ui/primitives'
import {BrandSearchInput} from './BrandSearchInput'

interface BrandToolbarProps {
    searchValue: string
    onSearchChange: (value: string) => void
    canMutate: boolean
    onCreateBrand: () => void
}

export function BrandToolbar({searchValue, onSearchChange, canMutate, onCreateBrand}: BrandToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <BrandSearchInput value={searchValue} onChange={onSearchChange}/>
            {canMutate && (
                <Button
                    variant="solid"
                    onClick={onCreateBrand}
                    className="w-full sm:w-auto"
                >
                    + New Brand
                </Button>
            )}
        </div>
    )
}
