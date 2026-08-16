import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {act, fireEvent, render, screen} from '@testing-library/react'
import {AdminLayout} from './AdminLayout'

vi.mock('./AdminHeader', () => ({
    AdminHeader: ({onMenuClick}: { onMenuClick: () => void }) => (
        <div data-testid="admin-header">
            <button onClick={onMenuClick} data-testid="burger-button">Menu</button>
        </div>
    ),
}))

vi.mock('./AdminSidebar', () => ({
    AdminSidebar: ({
                       isOpen,
                       onClose,
                       isCollapsed,
                       onSetCollapsed,
                   }: {
        isOpen: boolean
        onClose: () => void
        isCollapsed: boolean
        onSetCollapsed: (collapsed: boolean) => void
    }) => (
        <div data-testid="admin-sidebar" data-open={isOpen} data-collapsed={isCollapsed}>
            <button onClick={onClose} data-testid="close-sidebar">Close</button>
            <button onClick={() => onSetCollapsed(true)} data-testid="collapse-sidebar">Collapse</button>
        </div>
    ),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {...actual, Outlet: () => <div data-testid="outlet"/>}
})

// A capable-enough matchMedia mock: exposes `change` listener registration so
// tests can simulate the viewport crossing the md: breakpoint after mount,
// which Object.defineProperty(matchMedia, {matches: fixed value}) cannot.
function mockMatchMedia(initialMatches: boolean) {
    let matches = initialMatches
    let changeHandler: (() => void) | null = null

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            get matches() {
                return matches
            },
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn((_event: string, handler: () => void) => {
                changeHandler = handler
            }),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })

    return {
        simulateViewportChange(nextMatches: boolean) {
            matches = nextMatches
            changeHandler?.()
        },
    }
}

describe('AdminLayout', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        mockMatchMedia(true)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders AdminHeader, AdminSidebar, and Outlet (Req 1.1)', () => {
        render(<AdminLayout/>)

        expect(screen.getByTestId('admin-header')).toBeInTheDocument()
        expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
        expect(screen.getByTestId('outlet')).toBeInTheDocument()
    })

    it('toggles sidebar open state when burger is clicked (Req 1.2)', () => {
        render(<AdminLayout/>)

        expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'false')

        fireEvent.click(screen.getByTestId('burger-button'))
        expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'true')

        fireEvent.click(screen.getByTestId('burger-button'))
        expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'false')
    })

    it('debounce prevents double-close flicker (Req 1.2)', () => {
        render(<AdminLayout/>)

        // Open the sidebar
        fireEvent.click(screen.getByTestId('burger-button'))
        expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'true')

        // First close triggers the debounce guard
        fireEvent.click(screen.getByTestId('close-sidebar'))
        expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'false')

        // Re-open via burger toggle
        fireEvent.click(screen.getByTestId('burger-button'))
        expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'true')

        // Within 50ms window, second close is ignored because closingRef is still true
        fireEvent.click(screen.getByTestId('close-sidebar'))
        expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'true')

        // After 50ms, the guard resets and close works again
        act(() => {
            vi.advanceTimersByTime(50)
        })

        fireEvent.click(screen.getByTestId('close-sidebar'))
        expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-open', 'false')
    })

    describe('collapsed state vs. viewport (responsive)', () => {
        it('forces the sidebar back out of collapsed mode when the viewport narrows below md:', () => {
            const mq = mockMatchMedia(true) // start at desktop width
            render(<AdminLayout/>)

            fireEvent.click(screen.getByTestId('collapse-sidebar'))
            expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-collapsed', 'true')

            // Viewport narrows below md: — the collapsed icon-rail has no meaning there
            act(() => {
                mq.simulateViewportChange(false)
            })
            expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-collapsed', 'false')
        })

        it('does not touch collapsed state while the viewport stays at md: or above', () => {
            const mq = mockMatchMedia(true)
            render(<AdminLayout/>)

            fireEvent.click(screen.getByTestId('collapse-sidebar'))
            expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-collapsed', 'true')

            act(() => {
                mq.simulateViewportChange(true)
            })
            expect(screen.getByTestId('admin-sidebar')).toHaveAttribute('data-collapsed', 'true')
        })
    })
})
