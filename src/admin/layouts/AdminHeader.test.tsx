import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {PageBackActionProvider, usePageBackAction} from '@/admin/context/PageBackActionContext'
import {AdminHeader} from './AdminHeader'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {...actual, useNavigate: () => mockNavigate}
})

// clientName is DB-sourced via a React Query hook; stub it so the header can
// render without a QueryClientProvider.
vi.mock('@/admin/hooks/useClientName', () => ({
    useClientName: () => 'Test Client',
}))

function renderHeader(props: { onMenuClick?: () => void; onToggleCollapsed?: () => void } = {}) {
    const onMenuClick = props.onMenuClick ?? vi.fn()
    const onToggleCollapsed = props.onToggleCollapsed ?? vi.fn()
    return render(
        <MemoryRouter>
            <AdminHeader onMenuClick={onMenuClick} onToggleCollapsed={onToggleCollapsed}/>
        </MemoryRouter>
    )
}

/** Stands in for PageLayout registering a back action — the real caller in production. */
function BackActionRegistrar({onClick, label}: { onClick: () => void; label?: string }) {
    usePageBackAction(onClick, label)
    return null
}

function renderHeaderWithBackAction(onClick: () => void, label?: string) {
    return render(
        <MemoryRouter>
            <PageBackActionProvider>
                <BackActionRegistrar onClick={onClick} label={label}/>
                <AdminHeader onMenuClick={vi.fn()} onToggleCollapsed={vi.fn()}/>
            </PageBackActionProvider>
        </MemoryRouter>
    )
}

describe('AdminHeader', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAdminAuthStore.setState({
            isSignedIn: true,
            token: 'test-token',
            role: 'SUPER_ADMIN',
            authority: ['SUPER_ADMIN'],
            userName: 'TestUser',
            email: 'test@example.com',
        })
    })

    it('displays the first letter of userName as avatar initial', () => {
        renderHeader()
        const avatarButton = screen.getByTitle('Staff Profile')
        expect(avatarButton).toHaveTextContent('T')
    })

    it('falls back to "A" when userName is null', () => {
        useAdminAuthStore.setState({userName: null})
        renderHeader()
        const avatarButton = screen.getByTitle('Staff Profile')
        expect(avatarButton).toHaveTextContent('A')
    })

    it('calls clearSession on logout click', async () => {
        const user = userEvent.setup()
        const mockClearSession = vi.fn()
        useAdminAuthStore.setState({clearSession: mockClearSession})

        renderHeader()

        await user.click(screen.getByTitle('Staff Profile'))
        await user.click(screen.getByText('Log Out'))

        expect(mockClearSession).toHaveBeenCalledTimes(1)
    })

    it('navigates to /admin/login after logout', async () => {
        const user = userEvent.setup()
        const mockClearSession = vi.fn()
        useAdminAuthStore.setState({clearSession: mockClearSession})

        renderHeader()

        await user.click(screen.getByTitle('Staff Profile'))
        await user.click(screen.getByText('Log Out'))

        expect(mockNavigate).toHaveBeenCalledWith('/admin/login', {replace: true})
    })

    it('calls onMenuClick when burger button is clicked', async () => {
        const user = userEvent.setup()
        const onMenuClick = vi.fn()

        renderHeader({onMenuClick})

        await user.click(screen.getByText('Open sidebar'))

        expect(onMenuClick).toHaveBeenCalledTimes(1)
    })

    it('calls onToggleCollapsed when the desktop collapse button is clicked', async () => {
        const user = userEvent.setup()
        const onToggleCollapsed = vi.fn()

        renderHeader({onToggleCollapsed})

        await user.click(screen.getByTitle('Collapse sidebar'))

        expect(onToggleCollapsed).toHaveBeenCalledTimes(1)
    })

    describe('profile menu dismissal', () => {
        // Reported bug: the menu stayed open after clicking elsewhere, so it sat over the
        // page until the trigger was pressed again.
        it('closes when the user clicks away', async () => {
            const user = userEvent.setup()
            renderHeader()

            await user.click(screen.getByTitle('Staff Profile'))
            expect(screen.getByRole('menu')).toBeInTheDocument()

            await user.click(document.body)

            expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        })

        it('closes on Escape', async () => {
            const user = userEvent.setup()
            renderHeader()

            await user.click(screen.getByTitle('Staff Profile'))
            expect(screen.getByRole('menu')).toBeInTheDocument()

            await user.keyboard('{Escape}')

            expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        })

        it('stays open when clicking inside it, so the theme controls remain usable', async () => {
            const user = userEvent.setup()
            renderHeader()

            await user.click(screen.getByTitle('Staff Profile'))
            await user.click(screen.getByLabelText('Dark Mode'))

            expect(screen.getByRole('menu')).toBeInTheDocument()
        })

        it('reports its state to assistive tech and flips the chevron', async () => {
            const user = userEvent.setup()
            renderHeader()

            const trigger = screen.getByTitle('Staff Profile')
            expect(trigger).toHaveAttribute('aria-expanded', 'false')

            await user.click(trigger)
            expect(trigger).toHaveAttribute('aria-expanded', 'true')
        })
    })

    describe('back button', () => {
        it('does not render when no page has registered a back action', () => {
            renderHeader()

            expect(screen.queryByRole('button', {name: /back/i})).not.toBeInTheDocument()
        })

        it('renders with the registered label once a page registers a back action', () => {
            renderHeaderWithBackAction(vi.fn(), 'Back to products')

            expect(screen.getByRole('button', {name: 'Back to products'})).toBeInTheDocument()
        })

        it('falls back to the default "Back" label when the page supplies none', () => {
            renderHeaderWithBackAction(vi.fn())

            expect(screen.getByRole('button', {name: 'Back'})).toBeInTheDocument()
        })

        it('calls the registered onClick when clicked', async () => {
            const user = userEvent.setup()
            const onClick = vi.fn()
            renderHeaderWithBackAction(onClick, 'Back to products')

            await user.click(screen.getByRole('button', {name: 'Back to products'}))

            expect(onClick).toHaveBeenCalledTimes(1)
        })
    })

    describe('identity in the header', () => {
        it('shows the signed-in name and their role label', () => {
            renderHeader()

            expect(screen.getAllByText('TestUser').length).toBeGreaterThan(0)
            // The stored value is SUPER_ADMIN; staff see the human label.
            expect(screen.getAllByText('Super Admin').length).toBeGreaterThan(0)
        })
    })
})
