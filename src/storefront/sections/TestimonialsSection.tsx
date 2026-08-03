import {cn} from '@/shared/utils/cn'
import type {TestimonialsSectionConfig} from '@/shared/types/StorefrontConfig'
import {useTestimonials} from '@/storefront/hooks/useTestimonials'
import {Carousel, Section, SectionHeading} from './shared'

export function TestimonialsSection({section}: { section: TestimonialsSectionConfig }) {
    const {
        layout = 'grid',
        columns = 3,
        title = 'Testimonials',
        eyebrow,
        variant,
        carouselControls,
    } = section.props

    // Resolve the carousel hint — default is 'gutter' (current treatment).
    // Unknown values fall back to 'gutter' rather than throwing.
    const resolvedControls: 'header' | 'gutter' | 'overlay' =
        carouselControls === 'header' || carouselControls === 'overlay'
            ? carouselControls
            : 'gutter'

    const {data: testimonials, isLoading, isError} = useTestimonials()

    const columnClasses: Record<1 | 2 | 3, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
    }

    const isStacked = layout === 'stacked'
    const isDark = variant === 'dark'

    if (isLoading) {
        return (
            <Section variant={variant}>
                <div className="h-8 w-48 rounded bg-(--sf-panel) animate-pulse mx-auto"/>
                <div
                    className={cn(
                        'mt-10 grid gap-8',
                        isStacked ? 'grid-cols-1' : columnClasses[columns],
                    )}
                >
                    {Array.from({length: columns}).map((_, i) => (
                        <div key={i} className="flex flex-col gap-4">
                            <div className="h-20 rounded bg-(--sf-panel) animate-pulse"/>
                            <div className="h-4 w-32 rounded bg-(--sf-panel) animate-pulse"/>
                        </div>
                    ))}
                </div>
            </Section>
        )
    }

    if (isError || !testimonials || testimonials.length === 0) {
        return null
    }

    const renderCard = (item: (typeof testimonials)[number]) => {
        if (isDark) {
            return (
                <div
                    key={item.id}
                    className="flex h-full w-full flex-col rounded-lg border p-6"
                    style={{
                        background: 'color-mix(in srgb, white 4%, transparent)',
                        borderColor: 'color-mix(in srgb, white 12%, transparent)',
                    }}
                >
                    <blockquote className="flex-1 italic text-white/90">
                        &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <p className="mt-4 text-sm font-medium text-white/80">
                        {item.authorName}
                        {item.authorTitle && `, ${item.authorTitle}`}
                    </p>
                </div>
            )
        }

        return (
            <div
                key={item.id}
                className="flex h-full w-full flex-col rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6"
            >
                <blockquote className="flex-1 italic text-(--sf-text)">
                    &ldquo;{item.quote}&rdquo;
                </blockquote>
                <p className="mt-4 text-sm font-medium text-(--sf-text)">
                    {item.authorName}
                    {item.authorTitle && `, ${item.authorTitle}`}
                </p>
            </div>
        )
    }

    return (
        <Section variant={variant}>
            {layout === 'carousel' && resolvedControls !== 'header' && (
                <SectionHeading eyebrow={eyebrow} title={title}/>
            )}

            {layout !== 'carousel' && (
                <SectionHeading eyebrow={eyebrow} title={title}/>
            )}

            {layout === 'carousel' ? (
                <Carousel
                    ariaLabel={title}
                    {...(resolvedControls === 'header'
                        ? {header: <SectionHeading eyebrow={eyebrow} title={title} className="mb-0"/>}
                        : resolvedControls === 'overlay'
                            ? {arrowPlacement: resolvedControls}
                            : {})}
                >
                    {testimonials.map((item) => renderCard(item))}
                </Carousel>
            ) : (
                <div
                    className={cn(
                        'grid gap-8',
                        isStacked ? 'grid-cols-1' : columnClasses[columns],
                    )}
                >
                    {testimonials.map((item) => renderCard(item))}
                </div>
            )}
        </Section>
    )
}
