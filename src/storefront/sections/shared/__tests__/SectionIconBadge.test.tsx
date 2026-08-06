import {describe, expect, it} from 'vitest'
import {render} from '@testing-library/react'
import {Truck} from 'lucide-react'

import {SectionIconBadge} from '../SectionIconBadge'

/**
 * The tones are a strength scale over one accent, and which surface each is safe
 * on is the load-bearing part. jsdom has no CSS engine, so contrast itself is
 * measured in a browser; what IS checkable here is that each tone keeps the
 * tile/icon pairing that makes it legible on its intended surface.
 */
describe('SectionIconBadge', () => {
    const tile = (el: HTMLElement) => el.querySelector('span')!
    const icon = (el: HTMLElement) => el.querySelector('svg')!

    it('defaults to soft, the quiet treatment for a light band', () => {
        const {container} = render(<SectionIconBadge icon={Truck}/>)

        expect(tile(container).className).toContain('var(--sf-accent)_10%')
        // On a light band the accent itself is the readable icon colour.
        expect(icon(container).getAttribute('class')).toContain('text-(--sf-accent)')
    })

    it('paints muted and solid icons in accent-text, never the accent', () => {
        // Both sit on dark bands. An accent icon there measures ~1.6:1 against an
        // accent tile over near-black and disappears — the exact reason `soft`
        // cannot simply be reused on a dark surface.
        for (const tone of ['muted', 'solid'] as const) {
            const {container} = render(<SectionIconBadge icon={Truck} tone={tone}/>)
            expect(icon(container).getAttribute('class'), tone).toContain('text-(--sf-accent-text)')
            expect(icon(container).getAttribute('class'), tone).not.toContain('text-(--sf-accent)"')
        }
    })

    it('orders the tones as a strength scale', () => {
        const pct = (tone: 'soft' | 'muted' | 'solid') => {
            const {container} = render(<SectionIconBadge icon={Truck} tone={tone}/>)
            return Number(tile(container).className.match(/var\(--sf-accent\)_(\d+)%/)![1])
        }

        expect(pct('soft')).toBeLessThan(pct('muted'))
        expect(pct('muted')).toBeLessThan(pct('solid'))
    })

    it('keeps one geometry across tones, so a mixed page reads as one system', () => {
        const geometry = (['soft', 'muted', 'solid'] as const).map((tone) => {
            const {container} = render(<SectionIconBadge icon={Truck} tone={tone}/>)
            return tile(container).className.replace(/bg-\[[^\]]+\]/, '').trim()
        })

        expect(new Set(geometry).size).toBe(1)
    })
})
