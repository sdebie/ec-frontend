// Imported from the files rather than the shared barrel: this component is inside that
// barrel, and routing back through it would make the module import itself.
import {Label} from '../form/Label'
import {Select} from '../form/Select'
import {DATE_RANGE_OPTIONS, type DateRangePreset} from './dateRangePresets'

export interface DateFilterProps {
    value: DateRangePreset
    onChange: (preset: DateRangePreset) => void
    /** Visible text beside the control. Pass `null` for a toolbar with no room for it. */
    label?: string | null
    /** Accessible name, when several date filters share a screen. */
    ariaLabel?: string
    className?: string
}

/**
 * A named date range, for any admin list that narrows by date.
 *
 * Reports the preset rather than the dates it stands for. A resolved range is only true on
 * the day it was resolved — a page left open overnight would go on filtering by yesterday —
 * so the caller keeps the preset and derives the range at the moment it queries, with
 * `resolveDateRange`.
 */
export function DateFilter({
                               value,
                               onChange,
                               label = 'Date',
                               ariaLabel = 'Filter by date',
                               className = 'min-w-40',
                           }: DateFilterProps) {
    return (
        <div className="flex items-center gap-2">
            {/* Select renders a button and takes no id, so the label names it via ariaLabel. */}
            {label && <Label className="mb-0">{label}</Label>}
            <Select
                options={DATE_RANGE_OPTIONS}
                value={value}
                onChange={(next) => onChange(next as DateRangePreset)}
                ariaLabel={ariaLabel}
                className={className}
            />
        </div>
    )
}
