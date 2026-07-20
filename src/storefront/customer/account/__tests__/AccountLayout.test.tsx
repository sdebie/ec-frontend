import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {AccountLayout} from '../AccountLayout.tsx'

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {...actual, Outlet: () => <div data-testid="outlet">Page Content</div>}
})

vi.mock('@/shared/auth/customerAuthStore', () => ({
    useCustomerAuthStore: (selector: (state: { isSignedIn: boolean }) => boolean) =>
        selector({isSignedIn: true}),
}))

function renderLayout(initialPath = '/account/dashboard') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/account/*" element={<AccountLayout/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

describe('AccountLayout', () => {
    const navLabels = ['Dashboard', 'Orders', 'Profile', 'Wishlist']

    describe('sidebar renders all nav items (Req 2.2)', () => {
        it('renders all 4 navigation labels in the desktop sidebar', () => {
            renderLayout()

            const desktopNav = screen.getByRole('navigation', {name: 'Account navigation'})

            for (const label of navLabels) {
                expect(desktopNav).toHaveTextContent(label)
            }
        })

        it('renders all 4 navigation labels in the mobile menu dialog', async () => {
            const user = userEvent.setup()
            renderLayout()

            const menuButton = screen.getByRole('button', {name: 'Account menu'})
            await user.click(menuButton)

            const navElements = screen.getAllByRole('navigation', {name: 'Account navigation'})
            // The second nav appears inside the mobile dialog
            const mobileNav = navElements[1]

            for (const label of navLabels) {
                expect(mobileNav).toHaveTextContent(label)
            }
        })
    })

    describe('active route is visually distinguished (Req 2.3)', () => {
        it('applies font-semibold to the active NavLink for /account/dashboard', () => {
            renderLayout('/account/dashboard')

            const dashboardLink = screen.getByRole('link', {name: 'Dashboard'})
            expect(dashboardLink).toHaveClass('font-semibold')
        })

        it('applies font-semibold to the active NavLink for /account/orders', () => {
            renderLayout('/account/orders')

            const ordersLink = screen.getByRole('link', {name: 'Orders'})
            expect(ordersLink).toHaveClass('font-semibold')
        })

        it('does not apply font-semibold to inactive NavLinks', () => {
            renderLayout('/account/dashboard')

            const ordersLink = screen.getByRole('link', {name: 'Orders'})
            expect(ordersLink).not.toHaveClass('font-semibold')
        })
    })

    describe('mobile layout uses hamburger menu (Req 2.5)', () => {
        it('renders a desktop nav with hidden md:block classes', () => {
            renderLayout()

            const desktopNav = screen.getByRole('navigation', {name: 'Account navigation'})
            expect(desktopNav).toHaveClass('hidden')
            expect(desktopNav).toHaveClass('md:block')
        })

        it('renders a mobile menu button visible on small screens', () => {
            renderLayout()

            const menuButton = screen.getByRole('button', {name: 'Account menu'})
            expect(menuButton).toBeInTheDocument()
        })

        it('renders the Outlet for child route content', () => {
            renderLayout()

            expect(screen.getByTestId('outlet')).toBeInTheDocument()
        })
    })
})
