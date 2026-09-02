export interface ItemRange {
    start: number
    end: number
}

/** Clamps a "Showing X to Y of Z" range so a stale page can't outlive a shrunk total. */
export function clampItemRange(currentPage: number, pageSize: number, totalItems: number): ItemRange {
    if (totalItems === 0) return {start: 0, end: 0}
    return {
        start: Math.min((currentPage - 1) * pageSize + 1, totalItems),
        end: Math.min(currentPage * pageSize, totalItems),
    }
}
