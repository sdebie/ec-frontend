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
})
