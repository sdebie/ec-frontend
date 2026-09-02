import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {PageBackActionProvider, usePageBackActionValue} from '@/admin/context/PageBackActionContext'
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

/** Surfaces PageBackActionContext's current value as text, so a test can assert on it. */
function BackActionProbe() {
    const action = usePageBackActionValue()
    return <div data-testid="back-action-probe">{action ? action.label ?? 'Back' : 'none'}</div>
}

function renderPageLayoutWithBackActionProbe(props: Partial<React.ComponentProps<typeof PageLayout>> = {}) {
    return render(
        <MemoryRouter>
            <PageBackActionProvider>
                <BackActionProbe/>
                <PageLayout title="Products" {...props}>
                    <div>page content</div>
                </PageLayout>
            </PageBackActionProvider>
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

    it('does not render a back button itself — that moved to the admin header', () => {
        renderPageLayout({onBack: () => {}})

        expect(screen.queryByRole('button', {name: /back/i})).not.toBeInTheDocument()
    })

    it('registers a back action in PageBackActionContext when onBack is provided, for AdminHeader to render', () => {
        renderPageLayoutWithBackActionProbe({onBack: () => {}, backLabel: 'Back to products'})

        expect(screen.getByTestId('back-action-probe')).toHaveTextContent('Back to products')
    })

    it('does not register a back action when onBack is omitted', () => {
        renderPageLayoutWithBackActionProbe()

        expect(screen.getByTestId('back-action-probe')).toHaveTextContent('none')
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

        it('does not render a sticky footer wrapper when omitted', () => {
            const {container} = renderPageLayout()

            expect(container.querySelector('.sticky')).not.toBeInTheDocument()
        })

        it('positions the footer with sticky/bottom-0, so it stays pinned within the page\'s own scroll region instead of the raw viewport', () => {
            renderPageLayout({stickyFooter: <button type="button">Save Changes</button>})

            const button = screen.getByRole('button', {name: 'Save Changes'})
            const stickyWrapper = button.closest('.sticky')!
            expect(stickyWrapper.className).toContain('bottom-0')
            // Sticky (unlike the old fixed+inset-x-0 bar) is a normal-flow box —
            // it needs no viewport-edge positioning to span its container's width.
            expect(stickyWrapper.className).not.toContain('inset-x-0')
            expect(stickyWrapper.className).not.toContain('fixed')
        })

        it('is not capped to the page Container width — the footer spans the page\'s own layout width, not the narrower Container max-width', () => {
            renderPageLayout({stickyFooter: <button type="button">Save Changes</button>, size: 'lg'})

            const button = screen.getByRole('button', {name: 'Save Changes'})
            const stickyWrapper = button.closest('.sticky')!

            expect(stickyWrapper.className).not.toContain('max-w')
            expect(button.closest('.mx-auto')).not.toBeInTheDocument()
        })

        it('adds its own trailing pb-4/md:pb-6 when there is no stickyFooter, so pages without one keep their bottom breathing room now that main provides none', () => {
            const {container} = renderPageLayout()

            const root = container.firstElementChild as HTMLElement
            expect(root.className).toContain('pb-4')
            expect(root.className).toContain('md:pb-6')
        })

        it('omits its own bottom padding when a stickyFooter is present, so the footer is the true last thing in the flow with nothing trailing after it', () => {
            const {container} = renderPageLayout({stickyFooter: <button type="button">Save Changes</button>})

            const root = container.firstElementChild as HTMLElement
            const classes = root.className.split(' ')
            expect(classes).not.toContain('pb-4')
            expect(classes).not.toContain('md:pb-6')
        })

        it('cancels main\'s own px-4/md:px-6 with matching negative margins, so the bar reaches the true edges of the content column', () => {
            renderPageLayout({stickyFooter: <button type="button">Save Changes</button>})

            const button = screen.getByRole('button', {name: 'Save Changes'})
            const stickyWrapper = button.closest('.sticky')!
            const outerClasses = stickyWrapper.className.split(' ')

            expect(outerClasses).toContain('-mx-4')
            expect(outerClasses).toContain('md:-mx-6')
            // Not just "contains px-4 somewhere" — the OUTER bar must carry none
            // of its own, or the negative margin only partially cancels main's gutter.
            expect(outerClasses).not.toContain('px-4')
            expect(outerClasses).not.toContain('md:px-6')
        })

        it('reapplies px-4/md:px-6 on an inner wrapper, so footer content still aligns with where page content starts', () => {
            renderPageLayout({stickyFooter: <button type="button">Save Changes</button>})

            const button = screen.getByRole('button', {name: 'Save Changes'})
            const stickyWrapper = button.closest('.sticky')!
            const innerWrapper = stickyWrapper.firstElementChild as HTMLElement
            const innerClasses = innerWrapper.className.split(' ')

            expect(innerClasses).toContain('px-4')
            expect(innerClasses).toContain('md:px-6')
            expect(innerWrapper.contains(button)).toBe(true)
        })

        it('renders the footer content exactly once — sticky positioning needs no space-reserving duplicate', () => {
            const {container} = renderPageLayout({stickyFooter: <button type="button">Save Changes</button>})

            const saveButtons = [...container.querySelectorAll('button')].filter((b) => b.textContent === 'Save Changes')
            expect(saveButtons).toHaveLength(1)
            expect(screen.getByRole('button', {name: 'Save Changes'})).toBeInTheDocument()
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
