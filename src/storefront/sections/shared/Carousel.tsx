import React, {useCallback, useEffect, useRef, useState} from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {ACCENT_BUTTON_HOVER, SF_FOCUS_RING_PAGE} from './focusRing'

interface CarouselProps {
    ariaLabel: string
    /** Whole cards visible per view at desktop width (default 3). */
    perView?: 2 | 3 | 4
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

// Cell widths are exact fractions of the viewport minus the gaps (gap-6 =
// 1.5rem), so each breakpoint shows precisely that many whole cards.
const CELL_BASIS: Record<2 | 3 | 4, string> = {
    2: 'md:w-[calc((100%-1.5rem)/2)]',
    3: 'md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]',
    4: 'md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]',
}

// Sub-`md` cell width. 1 (default) shows a single card at 85% so the next one
// peeks; 2 fits a pair, for decks whose cards stay legible at half a phone.
const MOBILE_CELL_BASIS: Record<1 | 2, string> = {
    1: 'w-[85%]',
    2: 'w-[calc((100%-1.5rem)/2)]',
}

// gap-6 between cells — the snap stride is cellWidth + this.
const GAP_PX = 24

export function Carousel({ariaLabel, perView = 3, perViewMobile = 1, arrowPlacement = 'gutter', header, children}: CarouselProps) {
    const headerControls = header != null
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
        const stride = (firstCell?.offsetWidth ?? 0) + GAP_PX
        setActiveIndex(Math.max(0, Math.min(cellCount - 1, Math.round(el.scrollLeft / stride))))
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
        // Header mode pages by a whole view (perView cards): one page stride is
        // perView * (cell + gap) = clientWidth + gap. Legacy keeps its partial
        // advance so the edge arrows behave as they always have.
        const amount = headerControls ? el.clientWidth + GAP_PX : el.clientWidth * 0.8
        el.scrollBy({left: direction * amount, behavior: 'smooth'})
    }

    const scrollToIndex = (index: number) => {
        const el = scrollRef.current
        if (!el) return
        const firstCell = el.firstElementChild as HTMLElement | null
        const stride = (firstCell?.offsetWidth ?? 0) + GAP_PX
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
                    // py-2: `overflow-x-auto` computes `overflow-y` to `auto`, so
                    // without vertical room the track clips whatever a card paints
                    // outside its box — its border, its hover shadow and the
                    // `hover:scale-[1.02]` lift all got cut off top and bottom.
                    className="flex gap-6 overflow-x-auto py-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                            (max-w-5xl content leaves ≥128px of gutter from 1280px up);
                            narrower viewports have too little gutter, so they overlay
                            the deck edges instead. */}
                        <button
                            type="button"
                            aria-label="Previous"
                            onClick={() => pageBy(-1)}
                            className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-(--sf-accent) p-2 text-white shadow-md transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} ${arrowPlacement === 'gutter' ? 'xl:-left-14' : ''}`}
                        >
                            <ChevronLeft className="h-5 w-5"/>
                        </button>
                        <button
                            type="button"
                            aria-label="Next"
                            onClick={() => pageBy(1)}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-(--sf-accent) p-2 text-white shadow-md transition-colors ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} ${arrowPlacement === 'gutter' ? 'xl:-right-14' : ''}`}
                        >
                            <ChevronRight className="h-5 w-5"/>
                        </button>
                    </>
                )}
            </div>

            {headerControls && showButtons && (
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
                                            ? 'w-5 bg-(--sf-accent)'
                                            : 'w-2 bg-(--sf-border) in-data-[variant=dark]:bg-white/30'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-(--sf-muted-text) in-data-[variant=dark]:text-white/60">
                        Swipe to browse
                    </p>
                </div>
            )}
        </div>
    )
}
