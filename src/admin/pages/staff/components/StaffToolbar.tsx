import { Search } from 'lucide-react'
import { Button, Input } from '@/shared/ui/primitives'

interface StaffToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  canMutate: boolean
  onAddStaff: () => void
}

export function StaffToolbar({ searchValue, onSearchChange, canMutate, onAddStaff }: StaffToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)" />
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {canMutate && (
        <Button onClick={onAddStaff} className="w-full sm:w-auto">
          Add staff member
        </Button>
      )}
    </div>
  )
}
