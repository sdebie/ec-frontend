/**
 * `formatDate`/`formatTime`/`formatDateTime` render `yyyy-mm-dd hh:mm` for admin tables —
 * staff scan these down a column, so the shape has to sort lexicographically and stay
 * unambiguous between conventions that disagree about whether 03-08 is March or August.
 * `formatDisplayDate`/`formatDisplayDateTime` render `15 Aug 2026` for customer-facing
 * prose (order history, legal-page footers), where a scannable, sortable column isn't the
 * point.
 *
 * Every one of these is built from the parts rather than `toLocaleDateString`/`Intl`, which
 * reorder and reword by the *browser's* locale: the same page would otherwise read one way
 * for one reader and another way for the next.
 *
 * Every function returns an empty string for anything unparseable, so a bad timestamp
 * costs a cell rather than throwing inside a table row.
 */

/** `2026-08-15` */
export function formatDate(value: string | null | undefined): string {
    const date = toDate(value)
    if (!date) return ''
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * `14:30` — 24-hour, so a time never has to be checked for an am/pm suffix, and two
 * times compare as written.
 */
export function formatTime(value: string | null | undefined): string {
    const date = toDate(value)
    if (!date) return ''
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** `2026-08-15 14:30` — the full timestamp on one line. */
export function formatDateTime(value: string | null | undefined): string {
    const date = formatDate(value)
    return date ? `${date} ${formatTime(value)}` : ''
}

const SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * `15 Aug 2026` — customer-facing prose (order history, legal-page footers), not a column
 * to scan or sort. Still built from parts rather than `toLocaleDateString`, for the same
 * reason as `formatDate`: it must read identically for every customer, not just every
 * machine in one office.
 */
export function formatDisplayDate(value: string | null | undefined): string {
    const date = toDate(value)
    if (!date) return ''
    return `${pad(date.getDate())} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/** `15 Aug 2026, 14:30` */
export function formatDisplayDateTime(value: string | null | undefined): string {
    const date = formatDisplayDate(value)
    return date ? `${date}, ${formatTime(value)}` : ''
}

function toDate(value: string | null | undefined): Date | null {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

function pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`
}
