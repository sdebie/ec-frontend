export type ControlSize = 'sm' | 'md' | 'lg'

/**
 * The shared height/padding/text-size recipe for every single-line form
 * control trigger (Input, Select, SearchableSelect, MultiSelect). Every
 * consumer reads this one token rather than hardcoding its own height,
 * so the size tiers cannot drift apart — a hardcoded height is
 * independent of this token and of every other consumer's.
 */
export const CONTROL_SIZE_CLASSES: Record<ControlSize, string> = {
    sm: 'h-(--c-control-h-sm) px-3 text-xs',
    md: 'h-(--c-control-h-md) px-4 text-sm',
    lg: 'h-(--c-control-h-lg) px-5 text-base',
}
