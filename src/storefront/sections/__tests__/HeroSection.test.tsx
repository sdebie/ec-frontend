import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import type {HeroSectionConfig} from '@/shared/types/StorefrontConfig'
import {HeroSection} from '../HeroSection'

const baseSection: HeroSectionConfig = {
    id: 'hero-1',
    type: 'hero',
    props: {
        title: 'Welcome to our store',
        subtitle: 'Shop the latest',
        primaryCta: {label: 'Shop Now', to: '/products'},
        secondaryCta: {label: 'Learn More', to: '/about'},
    },
}

function renderHero(section: HeroSectionConfig = baseSection) {
    return render(
        <MemoryRouter>
            <HeroSection section={section}/>
        </MemoryRouter>
    )
}

describe('HeroSection', () => {
    it('uses the standard fixed minimum height by default', () => {
        renderHero()
        expect(screen.getByRole('region', {name: 'Welcome to our store'}))
            .toHaveClass('min-h-[480px]')
    })

    it('uses the viewport-relative band when height is tall', () => {
        renderHero({
            ...baseSection,
            props: {...baseSection.props, height: 'tall'},
        })
        const section = screen.getByRole('region', {name: 'Welcome to our store'})
        expect(section).toHaveClass('min-h-[max(480px,calc(100vh-360px))]')
        expect(section).not.toHaveClass('min-h-[480px]')
    })

    it('renders title as <h2> inside a <section> with aria-label', () => {
        renderHero()

        const section = screen.getByRole('region', {name: 'Welcome to our store'})
        expect(section).toBeInTheDocument()

        const heading = screen.getByRole('heading', {level: 2})
        expect(heading).toHaveTextContent('Welcome to our store')
        expect(section).toContainElement(heading)
    })

    it('renders primaryCta as a Link with correct href', () => {
        renderHero()

        const link = screen.getByRole('link', {name: 'Shop Now'})
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/products')
    })

    it('renders secondaryCta as a Link with correct href', () => {
        renderHero()

        const link = screen.getByRole('link', {name: 'Learn More'})
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/about')
    })

    it('renders overlay when backgroundImageUrl is present', () => {
        const sectionWithBg: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                backgroundImageUrl: 'https://example.com/hero.jpg',
                overlayOpacity: 0.6,
            },
        }

        const {container} = renderHero(sectionWithBg)

        // Background renders as an explicit <img> filling the band via object-cover
        const bgImage = container.querySelector('img[aria-hidden="true"]')
        expect(bgImage).toBeInTheDocument()
        expect(bgImage).toHaveAttribute('src', 'https://example.com/hero.jpg')
        expect(bgImage).toHaveClass('absolute', 'inset-0', 'h-full', 'w-full', 'object-cover')

        const overlay = container.querySelector('div[aria-hidden="true"]')
        expect(overlay).toBeInTheDocument()
        expect(overlay).toHaveStyle({opacity: '0.6'})
    })

    it('does NOT render overlay when backgroundImageUrl is absent even if overlayOpacity is set', () => {
        const sectionWithoutBg: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                overlayOpacity: 0.8,
            },
        }

        const {container} = renderHero(sectionWithoutBg)

        const overlay = container.querySelector('[aria-hidden="true"]')
        expect(overlay).not.toBeInTheDocument()
    })

    describe('contentSurface safety contract', () => {
        it('falls back to the tokenised default surface when darkStyle is stale and there is no image (regression: about-hero)', () => {
            const staleSection: HeroSectionConfig = {
                ...baseSection,
                props: {
                    ...baseSection.props,
                    darkStyle: true, // no backgroundImageUrl set — this must not win
                },
            }

            renderHero(staleSection)

            const heading = screen.getByRole('heading', {level: 2})
            // Safe default: tokenised text colour, never a hardcoded white-on-white.
            expect(heading).toHaveClass('text-(--sf-text)')
            expect(heading).not.toHaveClass('text-white')

            const section = screen.getByRole('region', {name: 'Welcome to our store'})
            expect(section).toHaveClass('bg-(--sf-panel)')
        })

        it('honours darkStyle for on-image contrast when a background image is present', () => {
            const imageDarkSection: HeroSectionConfig = {
                ...baseSection,
                props: {
                    ...baseSection.props,
                    backgroundImageUrl: 'https://example.com/hero.jpg',
                    darkStyle: true,
                },
            }

            renderHero(imageDarkSection)

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveClass('text-(--sf-accent-text)')
        })

        it('renders the brand surface with tokenised accent background/text when explicitly configured', () => {
            const brandSection: HeroSectionConfig = {
                ...baseSection,
                props: {
                    ...baseSection.props,
                    contentSurface: 'brand',
                },
            }

            const {container} = renderHero(brandSection)

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveClass('text-(--sf-accent-text)')

            const section = container.querySelector('section')!
            expect(section).toHaveStyle({background: 'var(--sf-accent)'})
        })

        it('renders an explicit dark surface with no image as a bounded, tokenised panel (not raw white text)', () => {
            const darkNoImageSection: HeroSectionConfig = {
                ...baseSection,
                props: {
                    ...baseSection.props,
                    contentSurface: 'dark',
                },
            }

            const {container} = renderHero(darkNoImageSection)

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveClass('text-(--sf-accent-text)')
            expect(heading).not.toHaveClass('text-white')

            // No photo behind it, so it must render as a bounded panel, not a bare overlay.
            expect(container.querySelector('.rounded-2xl')).toBeInTheDocument()
            expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
        })

        it('explicit contentSurface takes precedence over darkStyle', () => {
            const conflicting: HeroSectionConfig = {
                ...baseSection,
                props: {
                    ...baseSection.props,
                    backgroundImageUrl: 'https://example.com/hero.jpg',
                    darkStyle: false,
                    contentSurface: 'dark',
                },
            }

            renderHero(conflicting)

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveClass('text-(--sf-accent-text)')
        })

        it('renders the kicker when provided', () => {
            const withKicker: HeroSectionConfig = {
                ...baseSection,
                props: {
                    ...baseSection.props,
                    kicker: 'ABOUT UVH HOLDINGS',
                },
            }

            renderHero(withKicker)

            expect(screen.getByText('ABOUT UVH HOLDINGS')).toBeInTheDocument()
        })
    })

    describe('contentPanel', () => {
        /** The copy block: the element carrying the panel skin (or not). */
        function copyBlock(container: HTMLElement) {
            return container.querySelector('.max-w-2xl')!
        }

        it('puts the copy straight on the photo by default — no panel', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {
                    ...baseSection.props,
                    backgroundImageUrl: 'storefront/hero.png',
                    darkStyle: true,
                },
            })

            const block = copyBlock(container)
            expect(block.className).not.toContain('bg-black/')
            expect(block.className).not.toContain('backdrop-blur')
            expect(block.className).not.toContain('rounded-2xl')
        })

        it('wraps the copy in a bounded blurred panel over a photo when contentPanel is true', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {
                    ...baseSection.props,
                    kicker: 'WHOLESALE & RETAIL SUPPLIER',
                    backgroundImageUrl: 'storefront/hero.png',
                    darkStyle: true,
                    contentPanel: true,
                    footnote: [{text: 'Quotes within 1 business day.'}],
                },
            })

            const block = copyBlock(container)
            expect(block.className).toContain('bg-black/40')
            expect(block.className).toContain('backdrop-blur-sm')
            expect(block.className).toContain('rounded-2xl')

            // Everything the panel is meant to back actually sits inside it.
            expect(block).toContainElement(screen.getByText('WHOLESALE & RETAIL SUPPLIER'))
            expect(block).toContainElement(screen.getByRole('heading', {level: 2}))
            expect(block).toContainElement(screen.getByText('Shop the latest'))
            expect(block).toContainElement(screen.getByRole('link', {name: 'Shop Now'}))
            expect(block).toContainElement(screen.getByRole('link', {name: 'Learn More'}))
            expect(block).toContainElement(screen.getByText('Quotes within 1 business day.'))
        })

        it('keeps the lighter wash for a panel with no photo behind it', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {...baseSection.props, contentSurface: 'dark'},
            })

            const block = copyBlock(container)
            expect(block.className).toContain('bg-black/10')
            expect(block.className).not.toContain('bg-black/55')
        })

        it('can suppress the derived no-photo panel with contentPanel: false', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {...baseSection.props, contentSurface: 'dark', contentPanel: false},
            })

            expect(copyBlock(container).className).not.toContain('bg-black/')
        })
    })

    describe('overlayStyle (scrim distribution)', () => {
        /**
         * The scrims sit between the photo and the copy. `gradient-left` renders
         * TWO — the ramp's direction changes at `md`, which an inline style
         * cannot express responsively — so pick by breakpoint class.
         */
        function scrim(container: HTMLElement, at: 'mobile' | 'desktop' = 'desktop') {
            const layers = Array.from(
                container.querySelectorAll('section > [aria-hidden="true"]'),
            ).filter((el) => el.tagName === 'DIV') as HTMLElement[]
            if (layers.length === 1) return layers[0]
            return at === 'mobile'
                ? layers.find((el) => el.className.includes('md:hidden'))!
                : layers.find((el) => el.className.includes('md:block'))!
        }

        it('defaults to a flat wash across the whole photo', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {
                    ...baseSection.props,
                    backgroundImageUrl: 'storefront/hero.png',
                    overlayOpacity: 0.5,
                },
            })

            const el = scrim(container)
            expect(el.style.backgroundColor).toBe('rgb(0, 0, 0)')
            expect(el.style.opacity).toBe('0.5')
            expect(el.style.backgroundImage).toBe('')
        })

        it('lays a single left-to-right ramp reaching full transparency when gradient-left', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {
                    ...baseSection.props,
                    backgroundImageUrl: 'storefront/hero.png',
                    overlayOpacity: 0.85,
                    overlayStyle: 'gradient-left',
                },
            })

            const el = scrim(container)
            const image = el.style.backgroundImage

            expect(image).toContain('linear-gradient(to right')
            // Full strength at the leading edge…
            expect(image).toContain('rgba(0, 0, 0, 0.85) 0%')
            // …and genuinely transparent before the right edge, so the photo is
            // untouched where no copy sits.
            expect(image).toMatch(/rgba\(0, 0, 0, 0\) 80%/)

            // Element opacity must stay unset — the alpha lives in the stops, and
            // an element opacity would scale the whole ramp a second time.
            expect(el.style.opacity).toBe('')

            // More than two stops: a bare from/to ramp puts a visible band across
            // the middle of the image, which is what this treatment avoids.
            expect(image.match(/rgba\(/g)!.length).toBeGreaterThan(3)
        })

        it('scales every stop with overlayOpacity, so the ramp never exceeds it', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {
                    ...baseSection.props,
                    backgroundImageUrl: 'storefront/hero.png',
                    overlayOpacity: 0.4,
                    overlayStyle: 'gradient-left',
                },
            })

            const alphas = Array.from(
                scrim(container).style.backgroundImage.matchAll(/rgba\(0, 0, 0, ([\d.]+)\)/g),
                (m) => Number(m[1]),
            )
            expect(Math.max(...alphas)).toBeCloseTo(0.4, 5)
            expect(Math.min(...alphas)).toBe(0)
            // Monotonically decreasing left → right: no bright band mid-ramp.
            expect([...alphas].sort((a, b) => b - a)).toEqual(alphas)
        })

        it('turns the ramp VERTICAL below md, where the copy is full-bleed', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {
                    ...baseSection.props,
                    backgroundImageUrl: 'storefront/hero.png',
                    overlayOpacity: 0.85,
                    overlayStyle: 'gradient-left',
                },
            })

            const mobile = scrim(container, 'mobile')
            const desktop = scrim(container, 'desktop')

            // A horizontal ramp is only correct while the copy is a column. On a
            // phone it is full-width, so every line ran through the fade and out
            // onto bare photograph.
            //
            // NB: jsdom serialises `to bottom` away — it is the initial direction
            // — so the vertical ramp is asserted as "a gradient that is NOT
            // horizontal", which is the property that actually matters here.
            expect(mobile.style.backgroundImage).toContain('linear-gradient(')
            expect(mobile.style.backgroundImage).not.toContain('to right')
            expect(desktop.style.backgroundImage).toContain('linear-gradient(to right')

            // Exactly one is visible at any breakpoint — never both.
            expect(mobile.className).toContain('md:hidden')
            expect(desktop.className).toContain('hidden')
            expect(desktop.className).toContain('md:block')

            // The mobile ramp never fully clears: full-width copy needs backing
            // for its whole measure, so no stop may reach zero.
            const alphas = Array.from(
                mobile.style.backgroundImage.matchAll(/rgba\(0, 0, 0, ([\d.]+)\)/g),
                (m) => Number(m[1]),
            )
            expect(Math.min(...alphas)).toBeGreaterThan(0)
            expect(Math.max(...alphas)).toBeLessThanOrEqual(0.85)
        })

        it('renders a single scrim layer for the uniform style', () => {
            const {container} = renderHero({
                ...baseSection,
                props: {...baseSection.props, backgroundImageUrl: 'storefront/hero.png'},
            })

            const layers = Array.from(
                container.querySelectorAll('section > [aria-hidden="true"]'),
            ).filter((el) => el.tagName === 'DIV')
            expect(layers).toHaveLength(1)
        })
    })

    describe('kicker rule + footnote measure', () => {
        it('gives the kicker the same short rule every SectionHeading eyebrow has', () => {
            renderHero({
                ...baseSection,
                props: {...baseSection.props, kicker: 'WHOLESALE & RETAIL SUPPLIER'},
            })

            const kicker = screen.getByText('WHOLESALE & RETAIL SUPPLIER')
            const rule = kicker.querySelector('span[aria-hidden="true"]')
            expect(rule).not.toBeNull()
            // Same geometry as the section eyebrow's rule, and it leads the text.
            expect(rule!.className).toContain('h-0.5')
            expect(rule!.className).toContain('w-4')
            expect(kicker.firstElementChild).toBe(rule)
            expect(kicker.className).toContain('flex')
            // It IS the shared eyebrow, not a lookalike — so it carries the hook
            // the dark-band stylesheet rule keys on.
            expect(kicker.hasAttribute('data-eyebrow')).toBe(true)
        })

        it('moves the rule with the copy when the hero is centred', () => {
            renderHero({
                ...baseSection,
                props: {...baseSection.props, kicker: 'LEAD IN', contentAlignment: 'center'},
            })
            // text-center does nothing to a flex row — the pair needs justifying.
            expect(screen.getByText('LEAD IN').className).toContain('justify-center')
        })

        it('caps the footnote to the same measure as the intro', () => {
            renderHero({
                ...baseSection,
                props: {
                    ...baseSection.props,
                    footnote: [{text: 'Quotes within 1 business day.'}],
                },
            })

            const intro = screen.getByText('Shop the latest')
            const footnote = screen.getByText('Quotes within 1 business day.').closest('p')!

            // The footnote continues the intro, so it must not overhang it.
            expect(intro.className).toContain('max-w-xl')
            expect(footnote.className).toContain('max-w-xl')
        })
    })

    describe('optical centring', () => {
        it('lifts the copy off true centre', () => {
            const {container} = renderHero()
            const grid = container.querySelector('section > .relative.z-10')!
            expect(grid.className).toContain('-translate-y-6')
        })
    })
})

describe('HeroSection footnote (design C8)', () => {
    it('renders nothing when footnote is absent (byte-identical to today)', () => {
        const {container} = renderHero()
        // The footnote container has both mt-4 and text-sm; no such element should exist
        const footnoteEl = container.querySelector('.mt-4.text-sm')
        expect(footnoteEl).not.toBeInTheDocument()
    })

    it('renders nothing when footnote is an empty array', () => {
        const {container} = renderHero({
            ...baseSection,
            props: {...baseSection.props, footnote: []},
        })
        // The footnote container has both mt-4 and text-sm; the subtitle has mt-4 but not text-sm
        const footnoteEl = container.querySelector('.mt-4.text-sm')
        expect(footnoteEl).not.toBeInTheDocument()
    })

    it('renders text-only segments as spans within a styled paragraph', () => {
        const section: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                footnote: [
                    {text: 'Competitive bulk pricing'},
                    {text: ' — quotes within 1 business day.'},
                ],
            },
        }

        renderHero(section)

        expect(screen.getByText('Competitive bulk pricing')).toBeInTheDocument()
        expect(screen.getByText('— quotes within 1 business day.', {exact: false})).toBeInTheDocument()
        // Both should be spans, not links
        expect(screen.getByText('Competitive bulk pricing').tagName).toBe('SPAN')
        expect(screen.getByText('— quotes within 1 business day.', {exact: false}).tagName).toBe('SPAN')
    })

    it('renders segments with `to` as internal Link elements with underline and focus recipe', () => {
        const section: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                footnote: [
                    {text: 'Need a quote?'},
                    {text: ' Request one here', to: '/quote-request'},
                ],
            },
        }

        renderHero(section)

        expect(screen.getByText('Need a quote?')).toBeInTheDocument()
        expect(screen.getByText('Need a quote?').tagName).toBe('SPAN')

        const link = screen.getByRole('link', {name: /Request one here/})
        expect(link).toHaveAttribute('href', '/quote-request')
        expect(link).toHaveClass('underline')
        // Focus recipe applied
        expect(link).toHaveClass('outline-none')
        expect(link).toHaveClass('focus-visible:ring-2')
        expect(link).toHaveClass('focus-visible:ring-(--sf-ring)')
    })

    it('uses SURFACE_SUBTITLE_CLASS colour from the default surface', () => {
        const section: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                footnote: [{text: 'Trust line'}],
            },
        }

        const {container} = renderHero(section)
        const footnoteParagraph = container.querySelector('.mt-4.text-sm')
        expect(footnoteParagraph).toBeInTheDocument()
        expect(footnoteParagraph).toHaveClass('text-(--sf-muted-text)')
    })

    it('uses SURFACE_SUBTITLE_CLASS colour from the brand surface', () => {
        const section: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                contentSurface: 'brand',
                footnote: [{text: 'Trust line'}],
            },
        }

        const {container} = renderHero(section)
        const footnoteParagraph = container.querySelector('.mt-4.text-sm')
        expect(footnoteParagraph).toBeInTheDocument()
        expect(footnoteParagraph).toHaveClass('text-(--sf-accent-text)/80')
    })

    it('uses SURFACE_SUBTITLE_CLASS colour from the dark surface', () => {
        const section: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                backgroundImageUrl: 'https://example.com/hero.jpg',
                contentSurface: 'dark',
                footnote: [{text: 'Trust line'}],
            },
        }

        const {container} = renderHero(section)
        const footnoteParagraph = container.querySelector('.mt-4.text-sm')
        expect(footnoteParagraph).toBeInTheDocument()
        expect(footnoteParagraph).toHaveClass('text-(--sf-accent-text)/80')
    })

    it('aligns left when contentAlignment is left', () => {
        const section: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                contentAlignment: 'left',
                footnote: [{text: 'Trust line'}],
            },
        }

        const {container} = renderHero(section)
        const footnoteParagraph = container.querySelector('.mt-4.text-sm')
        expect(footnoteParagraph).toBeInTheDocument()
        expect(footnoteParagraph).not.toHaveClass('text-center')
        expect(footnoteParagraph).not.toHaveClass('text-right')
    })

    it('aligns center when contentAlignment is center', () => {
        const section: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                contentAlignment: 'center',
                footnote: [{text: 'Trust line'}],
            },
        }

        const {container} = renderHero(section)
        const footnoteParagraph = container.querySelector('.mt-4.text-sm')
        expect(footnoteParagraph).toBeInTheDocument()
        expect(footnoteParagraph).toHaveClass('text-center')
    })

    it('aligns right when contentAlignment is right', () => {
        const section: HeroSectionConfig = {
            ...baseSection,
            props: {
                ...baseSection.props,
                contentAlignment: 'right',
                footnote: [{text: 'Trust line'}],
            },
        }

        const {container} = renderHero(section)
        const footnoteParagraph = container.querySelector('.mt-4.text-sm')
        expect(footnoteParagraph).toBeInTheDocument()
        expect(footnoteParagraph).toHaveClass('text-right')
    })
})
