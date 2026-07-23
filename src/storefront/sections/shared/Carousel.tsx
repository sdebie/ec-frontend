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
                {React.Children.map(children, (child, index) => (
                    <div
                        key={index}
                        className="flex snap-start shrink-0 w-[85%] md:w-[40%] lg:w-[30%]"
                    >
                        {child}
                    </div>
                ))}
            </div>

            {showButtons && (
                <>
                    <button
                        type="button"
                        aria-label="Previous"
                        onClick={scrollPrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-(--sf-accent) p-2 text-white shadow-md hover:opacity-90 transition-opacity"
                    >
                        <ChevronLeft className="h-5 w-5"/>
                    </button>
                    <button
                        type="button"
                        aria-label="Next"
                        onClick={scrollNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-(--sf-accent) p-2 text-white shadow-md hover:opacity-90 transition-opacity"
                    >
                        <ChevronRight className="h-5 w-5"/>
                    </button>
                </>
            )}
        </div>
    )
}
