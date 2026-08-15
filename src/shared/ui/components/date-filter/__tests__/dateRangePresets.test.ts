import {describe, expect, it} from 'vitest'
import {DateRangePreset, resolveDateRange} from '../dateRangePresets'

/** Local noon, so a test can never be moved across a day boundary by the runner's zone. */
const on = (year: number, month: number, day: number) => new Date(year, month - 1, day, 12)

describe('resolveDateRange', () => {
    it('ALL is no filter at all, not a very wide one', () => {
        // A wide range is still a range: it would reach the server as a query to answer, and
        // would silently exclude anything dated outside it.
        expect(resolveDateRange(DateRangePreset.ALL, on(2026, 8, 16))).toEqual({})
    })

    it('TODAY is a single day, both bounds', () => {
        expect(resolveDateRange(DateRangePreset.TODAY, on(2026, 8, 16))).toEqual({
            fromDate: '2026-08-16',
            toDate: '2026-08-16',
        })
    })

    describe('THIS_WEEK runs Monday to today', () => {
        it('mid-week reaches back to Monday', () => {
            // Thursday 2026-08-13 → Monday 2026-08-10.
            expect(resolveDateRange(DateRangePreset.THIS_WEEK, on(2026, 8, 13))).toEqual({
                fromDate: '2026-08-10',
                toDate: '2026-08-13',
            })
        })

        it('on Monday the week has only started', () => {
            expect(resolveDateRange(DateRangePreset.THIS_WEEK, on(2026, 8, 10))).toEqual({
                fromDate: '2026-08-10',
                toDate: '2026-08-10',
            })
        })

        it('Sunday closes the week it belongs to rather than opening a new one', () => {
            // The case getDay() gets wrong if taken at face value: Sunday is 0, so a naive
            // subtraction would jump forward to the coming Monday and produce a range whose
            // start is after its end — an empty list on the one day of the week with a full
            // week of orders behind it.
            expect(resolveDateRange(DateRangePreset.THIS_WEEK, on(2026, 8, 16))).toEqual({
                fromDate: '2026-08-10',
                toDate: '2026-08-16',
            })
        })

        it('reaches back across a month boundary', () => {
            // Wednesday 2026-09-02 → Monday 2026-08-31.
            expect(resolveDateRange(DateRangePreset.THIS_WEEK, on(2026, 9, 2))).toEqual({
                fromDate: '2026-08-31',
                toDate: '2026-09-02',
            })
        })
    })

    describe('THIS_MONTH runs from the 1st to today', () => {
        it('reaches back to the 1st', () => {
            expect(resolveDateRange(DateRangePreset.THIS_MONTH, on(2026, 8, 16))).toEqual({
                fromDate: '2026-08-01',
                toDate: '2026-08-16',
            })
        })

        it('on the 1st the month has only started', () => {
            expect(resolveDateRange(DateRangePreset.THIS_MONTH, on(2026, 8, 1))).toEqual({
                fromDate: '2026-08-01',
                toDate: '2026-08-01',
            })
        })

        it('January reaches back to the 1st of January, not December', () => {
            expect(resolveDateRange(DateRangePreset.THIS_MONTH, on(2026, 1, 9))).toEqual({
                fromDate: '2026-01-01',
                toDate: '2026-01-09',
            })
        })
    })

    it('formats single-digit months and days with a leading zero', () => {
        // The server parses yyyy-MM-dd; `2026-8-9` is not that, and a filter that fails to
        // parse is worse than one that returns nothing, because it looks like an empty list.
        expect(resolveDateRange(DateRangePreset.TODAY, on(2026, 3, 7))).toEqual({
            fromDate: '2026-03-07',
            toDate: '2026-03-07',
        })
    })

    it('reports the local calendar day, not the UTC one', () => {
        // 23:30 local is already tomorrow in UTC anywhere east of Greenwich. Going through
        // toISOString() would file the evening's orders under the wrong day.
        const lateEvening = new Date(2026, 7, 16, 23, 30)
        expect(resolveDateRange(DateRangePreset.TODAY, lateEvening).fromDate).toBe('2026-08-16')
    })

    it('never returns a range that starts after it ends', () => {
        const presets = [DateRangePreset.TODAY, DateRangePreset.THIS_WEEK, DateRangePreset.THIS_MONTH]
        // Every day of one week, so each weekday index is covered including Sunday.
        for (let day = 10; day <= 16; day++) {
            for (const preset of presets) {
                const {fromDate, toDate} = resolveDateRange(preset, on(2026, 8, day))
                expect(fromDate! <= toDate!).toBe(true)
            }
        }
    })
})
