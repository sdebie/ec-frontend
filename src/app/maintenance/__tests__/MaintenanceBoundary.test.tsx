import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MaintenanceBoundary} from '../MaintenanceBoundary'

function ThrowingComponent(): never {
    throw new Error('Test error')
}

function GoodComponent() {
    return <p>I am fine</p>
}

// These tests assert only on data-testid="maintenance-page" so the page's
// insides can be redesigned freely without touching them.
describe('MaintenanceBoundary', () => {
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        })
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    it('renders its children when nothing throws', () => {
        render(
            <MaintenanceBoundary>
                <GoodComponent/>
            </MaintenanceBoundary>
        )

        expect(screen.getByText('I am fine')).toBeInTheDocument()
        expect(screen.queryByTestId('maintenance-page')).not.toBeInTheDocument()
    })

    it('renders the maintenance page instead of crashing when a child throws', () => {
        render(
            <MaintenanceBoundary>
                <ThrowingComponent/>
            </MaintenanceBoundary>
        )

        expect(screen.getByTestId('maintenance-page')).toBeInTheDocument()
    })

    it('logs the caught error', () => {
        render(
            <MaintenanceBoundary>
                <ThrowingComponent/>
            </MaintenanceBoundary>
        )

        expect(consoleErrorSpy).toHaveBeenCalled()
    })
})
