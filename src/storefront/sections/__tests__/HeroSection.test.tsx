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
