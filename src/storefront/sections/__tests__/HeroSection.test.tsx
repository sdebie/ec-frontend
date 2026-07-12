import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import type {HeroSectionConfig} from '@/shared/types/StorefrontConfig.ts'
import {HeroSection} from '../HeroSection.tsx'

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

        const overlay = container.querySelector('[aria-hidden="true"]')
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
})
