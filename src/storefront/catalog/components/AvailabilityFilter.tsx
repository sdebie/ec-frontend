interface AvailabilityFilterProps {
  /** Whether the "In stock only" filter is currently active */
  checked: boolean
  /** Called when the checkbox state changes — writes to URL */
  onChange: (checked: boolean) => void
}

export function AvailabilityFilter({ checked, onChange }: AvailabilityFilterProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-(--sf-text)">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-(--sf-border) text-(--sf-accent) focus:ring-(--sf-ring)"
      />
      <span>In stock only</span>
    </label>
  )
}
