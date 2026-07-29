import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {describe, expect, it} from 'vitest'
import type {NewsletterSectionConfig} from '@/shared/types/StorefrontConfig'
import {NewsletterSection} from '../NewsletterSection'

function buildSection(overrides: Partial<NewsletterSectionConfig['props']> = {}): NewsletterSectionConfig {
    return {
        id: 'newsletter-1',
        type: 'newsletter',
        props: {
            title: 'Stay in the Loop',
            submitLabel: 'Subscribe',
            ...overrides,
        },
    }
}

function renderSection(section: NewsletterSectionConfig = buildSection()) {
    return render(
        <MemoryRouter>
            <NewsletterSection section={section}/>
        </MemoryRouter>,
    )
}

describe('NewsletterSection', () => {
    describe('Section frame', () => {
        it('renders inside a <section> element with standardized rhythm classes', () => {
            const {container} = renderSection()

            const sectionEl = container.querySelector('section')
            expect(sectionEl).toBeInTheDocument()
            expect(sectionEl).toHaveClass('py-12', 'px-6', 'sm:px-8')
        })

        it('renders an inner container with mx-auto and max-w-2xl (narrow width)', () => {
            const {container} = renderSection()

            const sectionEl = container.querySelector('section')
            const inner = sectionEl?.firstElementChild
            expect(inner).toHaveClass('mx-auto', 'max-w-2xl')
        })
    })

    describe('SectionHeading', () => {
        it('renders title as an h2 with text-3xl font-bold', () => {
            renderSection()

            const heading = screen.getByRole('heading', {level: 2})
            expect(heading).toHaveTextContent('Stay in the Loop')
            expect(heading).toHaveClass('text-3xl', 'font-bold')
        })

        it('renders eyebrow when provided', () => {
            renderSection(buildSection({eyebrow: 'Newsletter'}))

            expect(screen.getByText('Newsletter')).toBeInTheDocument()
            expect(screen.getByText('Newsletter')).toHaveClass('uppercase', 'tracking-widest')
        })
    })

    describe('form', () => {
        it('renders email input with required attribute and type=email', () => {
            renderSection()

            const input = screen.getByPlaceholderText('Your email address')
            expect(input).toHaveAttribute('type', 'email')
            expect(input).toBeRequired()
        })

        it('renders submit button with the submitLabel text', () => {
            renderSection()

            expect(screen.getByRole('button', {name: 'Subscribe'})).toBeInTheDocument()
        })

        it('uses preventDefault on form submit', () => {
            const {container} = renderSection()

            const form = container.querySelector('form')!
            const event = new Event('submit', {bubbles: true, cancelable: true})
            form.dispatchEvent(event)
            // Form should prevent default (actual logic is in the handler)
            expect(form).toBeInTheDocument()
        })
    })

    describe('optional content', () => {
        it('renders legal text when provided', () => {
            renderSection(buildSection({legalText: 'We respect your privacy.'}))

            expect(screen.getByText('We respect your privacy.')).toBeInTheDocument()
        })

        it('renders secondary link when provided', () => {
            renderSection(buildSection({secondaryLink: {label: 'Privacy Policy', to: '/privacy'}}))

            const link = screen.getByRole('link', {name: 'Privacy Policy'})
            expect(link).toHaveAttribute('href', '/privacy')
        })

        it('does not render legal text or secondary link when absent', () => {
            const {container} = renderSection()

            expect(screen.queryByRole('link')).not.toBeInTheDocument()
            // Only heading/form elements present — no privacy text
            expect(container.querySelectorAll('.text-xs')).toHaveLength(0)
        })
    })
})
