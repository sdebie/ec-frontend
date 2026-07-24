import React, {useCallback, useEffect, useRef, useState} from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'

interface CarouselProps {
    ariaLabel: string
    children: React.ReactNode
}

export function Carousel({ariaLabel, children}: CarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showButtons, setShowButtons] = useState(false)

    const checkOverflow = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        setShowButtons(el.scrollWidth > el.clientWidth)
    }, [])

    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        checkOverflow()

        const observer = new ResizeObserver(() => {
            checkOverflow()
        })
        observer.observe(el)

        return () => {
            observer.disconnect()
        }
    }, [checkOverflow])

    const scrollPrev = () => {
        const el = scrollRef.current
        if (!el) return
        el.scrollBy({left: -(el.clientWidth * 0.8), behavior: 'smooth'})
    }

    const scrollNext = () => {
        const el = scrollRef.current
        if (!el) return
        el.scrollBy({left: el.clientWidth * 0.8, behavior: 'smooth'})
    }

    return (
        <div className="relative" aria-label={ariaLabel} role="region">
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {/* Cell widths are exact fractions of the viewport minus the gaps
                    (gap-6 = 1.5rem), so lg shows precisely three whole cards. */}
                {React.Children.map(children, (child, index) => (
                    <div
                        key={index}
                        className="flex snap-start shrink-0 w-[85%] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                    >
                        {child}
                    </div>
                ))}
            </div>

            {showButtons && (
                <>
                    {/* At xl+ the arrows sit in the section gutter OUTSIDE the deck
                        (max-w-5xl content leaves ≥128px of gutter from 1280px up);
                        narrower viewports have too little gutter, so they overlay
                        the deck edges instead. */}
                    <button
                        type="button"
                        aria-label="Previous"
                        onClick={scrollPrev}
                        className="absolute left-2 xl:-left-14 top-1/2 -translate-y-1/2 rounded-full bg-(--sf-accent) p-2 text-white shadow-md hover:opacity-90 transition-opacity"
                    >
                        <ChevronLeft className="h-5 w-5"/>
                    </button>
                    <button
                        type="button"
                        aria-label="Next"
                        onClick={scrollNext}
                        className="absolute right-2 xl:-right-14 top-1/2 -translate-y-1/2 rounded-full bg-(--sf-accent) p-2 text-white shadow-md hover:opacity-90 transition-opacity"
                    >
                        <ChevronRight className="h-5 w-5"/>
                    </button>
                </>
            )}
        </div>
    )
}
