/**
 * The named date ranges an admin list can be narrowed to.
 *
 * `ALL` is the cleared state, not a range — it must resolve to no bounds at all rather than
 * to some very wide pair of dates, so that "no filter" reaches the server as an absent
 * argument and not as a query the server has to answer.
 */
export const DateRangePreset = {
    ALL: 'ALL',
    TODAY: 'TODAY',
    THIS_WEEK: 'THIS_WEEK',
    THIS_MONTH: 'THIS_MONTH',
} as const

export type DateRangePreset = (typeof DateRangePreset)[keyof typeof DateRangePreset]

/** Inclusive `yyyy-MM-dd` bounds, both absent when nothing is being filtered. */
export interface DateRange {
    fromDate?: string
    toDate?: string
}

/**
 * Local calendar date as `yyyy-MM-dd`.
 *
 * Built from the local parts rather than `toISOString()`, which converts to UTC first: east
 * of Greenwich that shifts an early-morning "today" back to yesterday, so the filter would
 * quietly exclude the very orders the reader is looking for.
 */
function toIsoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
    const shifted = new Date(date)
    shifted.setDate(shifted.getDate() + days)
    return shifted
}

/**
 * The bounds a preset covers, relative to `today`.
 *
 * Both bounds are inclusive whole days, matching what the server expects — it widens the
 * upper one to the following midnight itself, so a range never has to be described here as
 * a half-open interval.
 *
 * `today` is a parameter rather than a call to `new Date()` inside, so a caller can resolve
 * a range for a given day and a test can pin one without touching the clock.
 */
export function resolveDateRange(preset: DateRangePreset, today: Date = new Date()): DateRange {
    const asOf = toIsoDate(today)

    switch (preset) {
        case DateRangePreset.ALL:
            return {}

        case DateRangePreset.TODAY:
            return {fromDate: asOf, toDate: asOf}

        case DateRangePreset.THIS_WEEK: {
            // Weeks run Monday to Sunday. getDay() counts from Sunday, so Sunday (0) is the
            // seventh day of the week that is ending, not the first day of a new one.
            const dayOfWeek = today.getDay()
            const sinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
            return {fromDate: toIsoDate(addDays(today, -sinceMonday)), toDate: asOf}
        }

        case DateRangePreset.THIS_MONTH: {
            const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
            return {fromDate: toIsoDate(firstOfMonth), toDate: asOf}
        }
    }
}

export const DATE_RANGE_OPTIONS = [
    {value: DateRangePreset.ALL, label: 'All dates'},
    {value: DateRangePreset.TODAY, label: 'Today'},
    {value: DateRangePreset.THIS_WEEK, label: 'This Week'},
    {value: DateRangePreset.THIS_MONTH, label: 'This Month'},
]
