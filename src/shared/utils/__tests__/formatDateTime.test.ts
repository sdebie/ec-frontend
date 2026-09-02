import { describe, it, expect } from 'vitest'

import { formatDate, formatTime, formatDateTime, formatDisplayDate, formatDisplayDateTime } from '../formatDateTime'

/**
 * The shape is the point. Staff scan these down a column, so it has to be identical on
 * every machine — which is exactly what `toLocaleDateString` does not promise — and
 * unambiguous between conventions that disagree about whether 03-08 is March or August.
 */
describe('formatDate', () => {
    it('renders yyyy-mm-dd', () => {
        expect(formatDate('2026-08-15T14:30:00')).toBe('2026-08-15')
    })

    it('zero-pads month and day, so the column aligns and sorts as written', () => {
        expect(formatDate('2026-03-08T09:05:00')).toBe('2026-03-08')
    })

    it('handles the year boundaries', () => {
        expect(formatDate('2026-01-01T00:00:00')).toBe('2026-01-01')
        expect(formatDate('2026-12-31T23:59:00')).toBe('2026-12-31')
    })

    it.each([null, undefined, '', 'not a date'])('returns empty for %s rather than throwing', (value) => {
        expect(formatDate(value)).toBe('')
    })
})

describe('formatTime', () => {
    it('is 24-hour and zero-padded', () => {
        expect(formatTime('2026-08-15T09:05:00')).toBe('09:05')
        expect(formatTime('2026-08-15T14:30:00')).toBe('14:30')
    })

    it('renders midnight as 00:00 rather than 24:00 or 12:00', () => {
        expect(formatTime('2026-08-15T00:00:00')).toBe('00:00')
    })

    it.each([null, undefined, '', 'not a date'])('returns empty for %s rather than throwing', (value) => {
        expect(formatTime(value)).toBe('')
    })
})

describe('formatDateTime', () => {
    it('joins the two with a single space', () => {
        expect(formatDateTime('2026-08-15T14:30:00')).toBe('2026-08-15 14:30')
    })

    /** No dangling separator when there is nothing to join. */
    it('returns empty rather than a lone space for a bad value', () => {
        expect(formatDateTime('not a date')).toBe('')
    })
})

describe('formatDisplayDate', () => {
    it('renders day month(short) year', () => {
        expect(formatDisplayDate('2026-08-15T14:30:00')).toBe('15 Aug 2026')
    })

    it('zero-pads a single-digit day, so cards in a grid do not jitter width', () => {
        expect(formatDisplayDate('2026-08-05T14:30:00')).toBe('05 Aug 2026')
    })

    it('handles the year boundaries', () => {
        expect(formatDisplayDate('2026-01-01T00:00:00')).toBe('01 Jan 2026')
        expect(formatDisplayDate('2026-12-31T23:59:00')).toBe('31 Dec 2026')
    })

    it.each([null, undefined, '', 'not a date'])('returns empty for %s rather than throwing', (value) => {
        expect(formatDisplayDate(value)).toBe('')
    })
})

describe('formatDisplayDateTime', () => {
    it('joins the date and time with a comma', () => {
        expect(formatDisplayDateTime('2026-08-15T14:30:00')).toBe('15 Aug 2026, 14:30')
    })

    it('returns empty rather than a dangling comma for a bad value', () => {
        expect(formatDisplayDateTime('not a date')).toBe('')
    })
})
