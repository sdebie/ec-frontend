import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {PageLayout} from '../PageLayout'

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {...actual, useNavigate: () => vi.fn()}
})

function renderPageLayout(props: Partial<React.ComponentProps<typeof PageLayout>> = {}) {
    return render(
        <MemoryRouter>
            <PageLayout title="Products" {...props}>
                <div>page content</div>
            </PageLayout>
        </MemoryRouter>,
    )
}

describe('PageLayout', () => {
    it('renders the title as an h1 with text-(--c-text) class', () => {
        renderPageLayout()

        const heading = screen.getByRole('heading', {level: 1, name: 'Products'})
        expect(heading).toBeInTheDocument()
        expect(heading.className).toContain('text-(--c-text)')
    })

    it('renders PageBackButton when onBack is provided', () => {
        renderPageLayout({onBack: () => {}})

        expect(screen.getByRole('button', {name: /back/i})).toBeInTheDocument()
    })

    it('does not render a back button when onBack is omitted', () => {
        renderPageLayout()

        expect(screen.queryByRole('button', {name: /back/i})).not.toBeInTheDocument()
    })

    it('renders a subtitle when provided', () => {
        renderPageLayout({subtitle: 'Manage your catalog'})

        expect(screen.getByText('Manage your catalog')).toBeInTheDocument()
    })

    it('does not render a subtitle when omitted', () => {
        renderPageLayout()

        expect(screen.queryByText('Manage your catalog')).not.toBeInTheDocument()
    })

    it('renders the action slot in the header row', () => {
        renderPageLayout({action: <button type="button">Create</button>})

        const actionButton = screen.getByRole('button', {name: 'Create'})
        expect(actionButton).toBeInTheDocument()
        // Action is in a shrink-0 wrapper within the header flex row
        expect(actionButton.parentElement!.className).toContain('shrink-0')
    })

    it('wraps children in a Container element', () => {
        renderPageLayout()

        const content = screen.getByText('page content')
        // Default size="xl" resolves to a real, compiling Tailwind class (max-w-9xl doesn't exist
        // in Tailwind's default theme and silently applies no width cap at all).
        const container = content.parentElement!
        expect(container.className).toContain('max-w-[100rem]')
        expect(container.className).toContain('mx-auto')
    })

    it('defaults Container to size="xl" (max-w-[100rem])', () => {
        renderPageLayout()

        const content = screen.getByText('page content')
        expect(content.parentElement!.className).toContain('max-w-[100rem]')
    })

    it('passes an explicit size prop through to Container, overriding the xl default', () => {
        renderPageLayout({size: 'lg'})

        const content = screen.getByText('page content')
        const container = content.parentElement!
        expect(container.className).toContain('max-w-7xl')
        expect(container.className).not.toContain('max-w-[100rem]')
    })

    describe('stickyFooter', () => {
        it('renders the footer content when provided', () => {
            renderPageLayout({stickyFooter: <button type="button">Save Changes</button>})

            expect(screen.getByRole('button', {name: 'Save Changes'})).toBeInTheDocument()
        })

        it('does not render a fixed footer wrapper when omitted', () => {
            const {container} = renderPageLayout()

            expect(container.querySelector('.fixed')).not.toBeInTheDocument()
        })

        it('positions the footer with fixed/inset-x-0/bottom-0, spanning the full viewport width', () => {
            renderPageLayout({stickyFooter: <button type="button">Save Changes</button>})

            const button = screen.getByRole('button', {name: 'Save Changes'})
            const fixedWrapper = button.closest('.fixed')!
            expect(fixedWrapper.className).toContain('inset-x-0')
            expect(fixedWrapper.className).toContain('bottom-0')
        })

        it('is not capped to the page Container width — the fixed bar must reach the true viewport edges, not the page\'s own max-width', () => {
            renderPageLayout({stickyFooter: <button type="button">Save Changes</button>, size: 'lg'})

            const button = screen.getByRole('button', {name: 'Save Changes'})
            const fixedWrapper = button.closest('.fixed')!

            expect(fixedWrapper.className).not.toContain('max-w')
            expect(button.closest('.mx-auto')).not.toBeInTheDocument()
        })

        it('reserves space for the fixed footer with an invisible spacer carrying identical content, so real content is never hidden underneath it', () => {
            const {container} = renderPageLayout({stickyFooter: <button type="button">Save Changes</button>})

            // Two "Save Changes" buttons exist in the DOM (spacer + real bar)...
            const allButtons = container.querySelectorAll('button')
            const saveButtons = [...allButtons].filter((b) => b.textContent === 'Save Changes')
            expect(saveButtons).toHaveLength(2)

            // ...but accessibility-aware queries still find exactly one, because
            // the spacer is `visibility:hidden`, not merely visually offset.
            expect(screen.getByRole('button', {name: 'Save Changes'})).toBeInTheDocument()

            const spacer = saveButtons.find((b) => b.closest('.invisible'))!
            expect(spacer).toBeTruthy()
        })

        it('coexists with a header action — the two are independent slots', () => {
            renderPageLayout({
                action: <button type="button">Create</button>,
                stickyFooter: <button type="button">Save Changes</button>,
            })

            expect(screen.getByRole('button', {name: 'Create'})).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Save Changes'})).toBeInTheDocument()
        })
    })
})
