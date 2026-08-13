export type ControlSize = 'sm' | 'md' | 'lg'

/**
 * The shared height/padding/text-size recipe for every single-line form
 * control trigger (Input, Select, SearchableSelect, MultiSelect). One
 * source of truth so a size tier can't drift between components the way
 * it previously did — each of those had its own hardcoded height,
 * independent of this token and of each other.
 */
export const CONTROL_SIZE_CLASSES: Record<ControlSize, string> = {
    sm: 'h-(--c-control-h-sm) px-3 text-xs',
    md: 'h-(--c-control-h-md) px-4 text-sm',
    lg: 'h-(--c-control-h-lg) px-5 text-base',
}
