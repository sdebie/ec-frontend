/**
 * Timestamps in `yyyy-mm-dd hh:mm`.
 *
 * Built from the parts rather than `toLocaleDateString`, which reorders by the *browser's*
 * locale: the same column would read one way for one staff member and another way for
 * someone sitting next to them. This shape is also unambiguous between conventions that
 * disagree about whether 03-08 is March or August, and it sorts lexicographically, which
 * is what makes a column of them scannable.
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

function toDate(value: string | null | undefined): Date | null {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

function pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`
}
