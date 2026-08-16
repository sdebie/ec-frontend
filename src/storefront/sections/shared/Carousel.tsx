import React, {useCallback, useEffect, useRef, useState} from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from './focusRing'

interface CarouselProps {
    ariaLabel: string
    /** Whole cards visible per view at desktop width (default 3). */
    perView?: 2 | 3 | 4 | 5
    /**
     * 'gutter' (default): arrows sit outside the deck at xl+ (needs the section
     * gutter to be free). 'overlay': arrows always overlay the deck edges — use
     * when content flanks the deck (e.g. a showcase side image).
     * Ignored when `header` is set (header-controls mode).
     */
    arrowPlacement?: 'gutter' | 'overlay'
    /** Whole cards visible per view below `md` (default 1, with the next peeking). */
    perViewMobile?: 1 | 2
    /**
     * Colour context for the mobile pagination dots and "Swipe to browse" hint.
     * 'default' (page surface) or 'onAccent' for a deck sitting on a client
     * colour band, where the muted token disappears.
     */
    tone?: 'default' | 'onAccent'
    /**
     * Mobile control treatment, independent of where the desktop arrows sit.
     * 'dots' renders pagination dots + a "Swipe to browse" hint under the deck;
     * 'arrows' keeps the floating edge arrows on phones too.
     *
     * Defaults to what the header slot implies: 'dots' with a header, 'arrows'
     * without. Pass it explicitly when a section wants one without the other —
     * e.g. a band that renders its own heading, so needs no header row, but
     * still wants the quieter dotted treatment on phones.
     */
    mobileControls?: 'dots' | 'arrows'
    /**
     * Header-controls mode: the node (typically a SectionHeading with mb-0)
     * renders in a row above the deck with prev/next beside it on md+.
     * Mobile drops the floating arrows entirely — pagination dots + a
     * "Swipe to browse" hint render under the deck instead — and cells cap
     * at max-w-80 so a card's square image stage stays restrained on wide
     * phones while still previewing the next card.
     */
    header?: React.ReactNode
    children: React.ReactNode
}

// Cell widths are exact fractions of the viewport minus the gaps, so each
// breakpoint shows precisely that many whole cards. Every value is a complete
// literal class string — Tailwind scans source text, so an interpolated
// fraction would emit no CSS.
//
// ⚠️ These subtract (cards − 1) × the DESKTOP gap, which is `md:gap-4` = 1rem.
// Change the gap class and every fraction below must change with it, or the
// deck shows a sliver of the next card instead of whole ones.
const CELL_BASIS: Record<2 | 3 | 4 | 5, string> = {
    2: 'md:w-[calc((100%-1rem)/2)]',
    3: 'md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]',
    4: 'md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]',
    // 5 steps through 3-up at lg before going 5-up at xl: five cards in a
    // 1152px container is ~211px each, which is about as narrow as a product
    // card reads, and below xl there simply is not room for them.
    5: 'md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-4rem)/5)]',
}

// Sub-`md` cell width. 1 (default) shows a single card at 85% so the next one
// peeks; 2 fits a pair, for decks whose cards stay legible at half a phone.
// The 2-up fraction subtracts the MOBILE gap (gap-3 = 0.75rem), not the desktop one.
const MOBILE_CELL_BASIS: Record<1 | 2, string> = {
    1: 'w-[85%]',
    2: 'w-[calc((100%-0.75rem)/2)]',
}

// Mobile pagination treatment. 'default' reads against the page surface;
// 'onAccent' reads against a client-authored colour band, where the muted token
// would sink into the background — it uses the accent-text token, which is
// exactly the token the band's own heading uses.
const DOT_ACTIVE_CLASS: Record<'default' | 'onAccent', string> = {
    default: 'w-5 bg-(--sf-accent)',
    onAccent: 'w-5 bg-(--sf-accent-text)',
}
const DOT_IDLE_CLASS: Record<'default' | 'onAccent', string> = {
    default: 'w-2 bg-(--sf-border) in-data-[variant=dark]:bg-white/30',
    onAccent: 'w-2 bg-(--sf-accent-text)/40',
}
const HINT_CLASS: Record<'default' | 'onAccent', string> = {
    default: 'text-xs text-(--sf-muted-text) in-data-[variant=dark]:text-white/60',
    onAccent: 'text-xs text-(--sf-accent-text)',
}

// The gap is responsive (tighter below `md`), so the snap stride is measured off
// the live element rather than assumed — a hardcoded constant would page by the
// wrong amount on mobile.
function gapOf(el: HTMLElement): number {
    const gap = parseFloat(getComputedStyle(el).columnGap)
    return Number.isFinite(gap) ? gap : 0
}

export function Carousel({ariaLabel, perView = 3, perViewMobile = 1, tone = 'default', arrowPlacement = 'gutter', mobileControls, header, children}: CarouselProps) {
    const headerControls = header != null
    const usesDots = (mobileControls ?? (headerControls ? 'dots' : 'arrows')) === 'dots'
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showButtons, setShowButtons] = useState(false)
    const [canPrev, setCanPrev] = useState(false)
    const [canNext, setCanNext] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const cellCount = React.Children.count(children)

    const syncScrollState = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        setShowButtons(el.scrollWidth > el.clientWidth)
        setCanPrev(el.scrollLeft > 1)
        setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
        const firstCell = el.firstElementChild as HTMLElement | null
        const stride = (firstCell?.offsetWidth ?? 0) + gapOf(el)
        // Guard the divide: before layout (and in jsdom) the cell measures 0 and
        // the computed gap is absent, so an unguarded scrollLeft/stride is NaN
        // and no dot ever reads as current.
        const index = stride > 0 ? Math.round(el.scrollLeft / stride) : 0
        setActiveIndex(Math.max(0, Math.min(cellCount - 1, index)))
    }, [cellCount])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        syncScrollState()

        const observer = new ResizeObserver(() => {
            syncScrollState()
        })
        observer.observe(el)

        return () => {
            observer.disconnect()
        }
    }, [syncScrollState])

    const pageBy = (direction: 1 | -1) => {
        const el = scrollRef.current
        if (!el) return
        // A dotted deck pages by a whole view (perView cards): one page stride is
        // perView * (cell + gap) = clientWidth + gap, so a page lands on a cell
        // edge and the active dot stays truthful. Arrow decks advance partially,
        // so the next card peeks into view.
        const amount = usesDots ? el.clientWidth + gapOf(el) : el.clientWidth * 0.8
        el.scrollBy({left: direction * amount, behavior: 'smooth'})
    }

    const scrollToIndex = (index: number) => {
        const el = scrollRef.current
        if (!el) return
        const firstCell = el.firstElementChild as HTMLElement | null
        const stride = (firstCell?.offsetWidth ?? 0) + gapOf(el)
        el.scrollTo({left: index * stride, behavior: 'smooth'})
    }

    return (
        <div aria-label={ariaLabel} role="region">
            {header != null && (
                <div className="mb-8 flex items-end justify-between gap-4">
                    <div className="min-w-0 flex-1">{header}</div>
                    {showButtons && (
                        <div className="hidden shrink-0 items-center gap-2 md:flex">
                            <button
                                type="button"
                                aria-label="Previous"
                                onClick={() => pageBy(-1)}
                                disabled={!canPrev}
                                className={`rounded-full bg-(--sf-accent) p-2 text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:opacity-40 disabled:hover:bg-(--sf-accent)`}
                            >
                                <ChevronLeft className="h-5 w-5"/>
                            </button>
                            <button
                                type="button"
                                aria-label="Next"
                                onClick={() => pageBy(1)}
                                disabled={!canNext}
                                className={`rounded-full bg-(--sf-accent) p-2 text-(--sf-accent-text) shadow-sm transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} disabled:opacity-40 disabled:hover:bg-(--sf-accent)`}
                            >
                                <ChevronRight className="h-5 w-5"/>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="relative">
                <div
                    ref={scrollRef}
                    onScroll={syncScrollState}
                    // p-2 / -m-2: `overflow-x-auto` computes `overflow-y` to `auto`,
                    // so without room the track clips whatever a card paints outside
                    // its box — border, hover shadow and the `hover:scale-[1.02]`
                    // lift were cut off top and bottom, and the FIRST card's left
                    // edge was clipped at scrollLeft 0. The negative margin pulls the
                    // scrollport back out so cards still line up with the section
                    // gutter; scroll-pl-2 keeps `snap-start` landing on the card edge
                    // rather than the padding edge.
                    // md:gap-4 is load-bearing — CELL_BASIS above subtracts it.
                    className="flex gap-3 md:gap-4 overflow-x-auto p-2 -m-2 scroll-pl-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {React.Children.map(children, (child, index) => (
                        // *:w-full — the cell is a flex container (so cards stretch to
                        // equal height); without it a child that doesn't set w-full
                        // (e.g. ProductCard) shrinks to content width and cards render
                        // unequal despite equal cells.
                        <div
                            key={index}
                            className={`flex snap-start shrink-0 *:w-full ${MOBILE_CELL_BASIS[perViewMobile]} ${CELL_BASIS[perView]}${headerControls && perViewMobile === 1 ? ' max-w-80 md:max-w-none' : ''}`}
                        >
                            {child}
                        </div>
                    ))}
                </div>

                {!headerControls && showButtons && (
                    <>
                        {/* At xl+ the arrows sit in the section gutter OUTSIDE the deck
                            where there is room for them; narrower viewports have too
                            little gutter, so they overlay the deck edges instead.
                            ⚠️ The gutter shrank when the shared frame widened to
                            max-w-6xl — 'gutter' now needs a wider viewport before the
                            arrows clear the content, so re-measure before assuming it.
                            `max-md:hidden` only when the deck carries dots: the two
                            mobile treatments are alternatives, never both at once. */}
                        <button
                            type="button"
                            aria-label="Previous"
                            onClick={() => pageBy(-1)}
                            className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-(--sf-accent) p-2 text-white shadow-md transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} ${arrowPlacement === 'gutter' ? 'xl:-left-14' : ''}${usesDots ? ' max-md:hidden' : ''}`}
                        >
                            <ChevronLeft className="h-5 w-5"/>
                        </button>
                        <button
                            type="button"
                            aria-label="Next"
                            onClick={() => pageBy(1)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-(--sf-accent) p-2 text-white shadow-md transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} ${arrowPlacement === 'gutter' ? 'xl:-right-14' : ''}${usesDots ? ' max-md:hidden' : ''}`}
                        >
                            <ChevronRight className="h-5 w-5"/>
                        </button>
                    </>
                )}
            </div>

            {usesDots && showButtons && (
                <div className="mt-4 flex flex-col items-center gap-1 md:hidden">
                    <div className="flex items-center gap-1.5">
                        {Array.from({length: cellCount}).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                aria-label={`Go to item ${index + 1}`}
                                aria-current={index === activeIndex || undefined}
                                onClick={() => scrollToIndex(index)}
                                className="flex h-6 items-center"
                            >
                                <span
                                    className={`h-2 rounded-full transition-all ${
                                        index === activeIndex
                                            ? DOT_ACTIVE_CLASS[tone]
                                            : DOT_IDLE_CLASS[tone]
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className={HINT_CLASS[tone]}>
                        Swipe to browse
                    </p>
                </div>
            )}
        </div>
    )
}
