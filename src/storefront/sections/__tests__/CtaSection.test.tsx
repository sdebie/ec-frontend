import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {describe, expect, it} from 'vitest'
import type {CtaSectionConfig} from '@/shared/types/StorefrontConfig'
import {CtaSection} from '../CtaSection'

const section: CtaSectionConfig = {
    id: 'about-cta',
    type: 'cta',
    props: {
        title: 'Ready to Get Started?',
        cta: {label: 'Request a Quote', to: '/contact-us'},
        secondaryLinks: [
            {label: 'Wholesale enquiries', to: '/wholesale-application'},
            {label: 'Delivery & Returns', to: '/delivery-and-returns'},
        ],
    },
}

describe('CtaSection', () => {
    it('renders optional secondary links as internal navigation links', () => {
        render(
            <MemoryRouter>
                <CtaSection section={section}/>
            </MemoryRouter>,
        )

        expect(screen.getByRole('link', {name: 'Request a Quote'})).toHaveAttribute('href', '/contact-us')
        expect(screen.getByRole('link', {name: 'Wholesale enquiries'})).toHaveAttribute('href', '/wholesale-application')
        expect(screen.getByRole('link', {name: 'Delivery & Returns'})).toHaveAttribute('href', '/delivery-and-returns')
    })

    it('renders unchanged when eyebrow and secondaryCta are absent (backwards-compat)', () => {
        const minimalSection: CtaSectionConfig = {
            id: 'cta-minimal',
            type: 'cta',
            props: {
                title: 'Contact Us',
                cta: {label: 'Get in Touch', to: '/contact'},
            },
        }

        const {container} = render(
            <MemoryRouter>
                <CtaSection section={minimalSection}/>
            </MemoryRouter>,
        )

        // Title and primary CTA render
        expect(screen.getByText('Contact Us')).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Get in Touch'})).toHaveAttribute('href', '/contact')

        // No eyebrow rendered
        expect(container.querySelector('.uppercase.tracking-widest')).not.toBeInTheDocument()

        // Only one link (the primary CTA) — no secondary CTA, no secondary links
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(1)
    })

    it('renders eyebrow when present in config', () => {
        const sectionWithEyebrow: CtaSectionConfig = {
            id: 'cta-eyebrow',
            type: 'cta',
            props: {
                title: 'Need a Quote?',
                eyebrow: 'Business & Wholesale',
                cta: {label: 'Get a Quote', to: '/quote-request'},
            },
        }

        const {container} = render(
            <MemoryRouter>
                <CtaSection section={sectionWithEyebrow}/>
            </MemoryRouter>,
        )

        const eyebrowEl = screen.getByText('Business & Wholesale')
        expect(eyebrowEl).toBeInTheDocument()
        expect(eyebrowEl).toHaveClass('uppercase', 'tracking-widest')

        // The band renders the SHARED SectionEyebrow, so the colour is a token
        // class rather than an inline style and the accent rule comes with it.
        // On the accent band both parts use accent-text — an accent-coloured
        // rule would be invisible on accent.
        expect(eyebrowEl).toHaveClass('text-(--sf-accent-text)')
        expect(eyebrowEl.hasAttribute('data-eyebrow')).toBe(true)
        const rule = eyebrowEl.querySelector('span[aria-hidden="true"]')
        expect(rule).not.toBeNull()
        expect(rule!.className).toContain('bg-(--sf-accent-text)')
        // Eyebrow is above the title
        const title = screen.getByText('Need a Quote?')
        expect(container.contains(eyebrowEl)).toBe(true)
        expect(container.contains(title)).toBe(true)
    })

    it('renders secondaryCta outlined button when present', () => {
        const sectionWithSecondary: CtaSectionConfig = {
            id: 'cta-dual',
            type: 'cta',
            props: {
                title: 'Need a Quote or Buying in Bulk?',
                cta: {label: 'Get a Quote', to: '/quote-request'},
                secondaryCta: {label: 'Apply for Wholesale', to: '/wholesale-application'},
            },
        }

        render(
            <MemoryRouter>
                <CtaSection section={sectionWithSecondary}/>
            </MemoryRouter>,
        )

        const primaryLink = screen.getByRole('link', {name: 'Get a Quote'})
        const secondaryLink = screen.getByRole('link', {name: 'Apply for Wholesale'})

        expect(primaryLink).toHaveAttribute('href', '/quote-request')
        expect(secondaryLink).toHaveAttribute('href', '/wholesale-application')

        // Secondary button has outlined styling (border-2, bg-transparent)
        expect(secondaryLink).toHaveClass('border-2', 'bg-transparent')
        // Secondary button uses --sf-accent-text token for color
        expect(secondaryLink).toHaveStyle({color: 'var(--sf-accent-text)'})
    })

    it('secondaryCta links to correct path', () => {
        const sectionWithPath: CtaSectionConfig = {
            id: 'cta-path',
            type: 'cta',
            props: {
                title: 'Get Started',
                cta: {label: 'Primary', to: '/primary-path'},
                secondaryCta: {label: 'Secondary', to: '/custom-secondary-path'},
            },
        }

        render(
            <MemoryRouter>
                <CtaSection section={sectionWithPath}/>
            </MemoryRouter>,
        )

        expect(screen.getByRole('link', {name: 'Secondary'})).toHaveAttribute('href', '/custom-secondary-path')
    })

    it('uses --sf-* token styling for section background and text', () => {
        const accentSection: CtaSectionConfig = {
            id: 'cta-accent',
            type: 'cta',
            props: {
                title: 'Styled Section',
                cta: {label: 'Click', to: '/action'},
                variant: 'accent',
            },
        }

        const {container} = render(
            <MemoryRouter>
                <CtaSection section={accentSection}/>
            </MemoryRouter>,
        )

        const sectionEl = container.querySelector('section')!
        // Accent variant uses --sf-accent for background
        expect(sectionEl).toHaveStyle({background: 'var(--sf-accent)'})
        // Title uses --sf-accent-text
        expect(screen.getByText('Styled Section')).toHaveStyle({color: 'var(--sf-accent-text)'})
    })

    it('omits eyebrow and secondaryCta cleanly when absent', () => {
        render(
            <MemoryRouter>
                <CtaSection section={section}/>
            </MemoryRouter>,
        )

        // The original section fixture has no eyebrow or secondaryCta
        // Only the primary CTA and two secondary links should render
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(3) // primary + 2 secondaryLinks
        // No element with uppercase tracking-widestst (eyebrow)
        expect(screen.queryByText(/Business/)).not.toBeInTheDocument()
    })
})
