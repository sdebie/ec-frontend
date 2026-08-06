import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {PanelDisclosure} from '../PanelDisclosure'

describe('PanelDisclosure', () => {
    it('starts open, because the panel fields are informational', () => {
        render(
            <PanelDisclosure title="Description">
                <p>body copy</p>
            </PanelDisclosure>,
        )

        expect(screen.getByRole('button', {name: /description/i})).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText('body copy')).toBeInTheDocument()
    })

    it('honours defaultOpen=false', () => {
        render(
            <PanelDisclosure title="Description" defaultOpen={false}>
                <p>body copy</p>
            </PanelDisclosure>,
        )

        expect(screen.queryByText('body copy')).not.toBeInTheDocument()
    })

    it('hides its children when collapsed, so anything inside folds away with it', async () => {
        const user = userEvent.setup()
        render(
            <PanelDisclosure title="Description">
                <p>body copy</p>
                <p>SKU: ABC-123</p>
            </PanelDisclosure>,
        )

        await user.click(screen.getByRole('button', {name: /description/i}))

        // The SKU lives INSIDE the disclosure, so collapsing takes it too.
        expect(screen.queryByText('body copy')).not.toBeInTheDocument()
        expect(screen.queryByText(/SKU:/)).not.toBeInTheDocument()
        expect(screen.getByRole('button', {name: /description/i})).toHaveAttribute('aria-expanded', 'false')
    })

    it('gives each instance its own aria-controls target', () => {
        // A literal id would collide the moment a second field is added, pointing
        // both toggles at one panel — invisible to a typecheck and to the eye.
        render(
            <>
                <PanelDisclosure title="Description"><p>one</p></PanelDisclosure>
                <PanelDisclosure title="Categories"><p>two</p></PanelDisclosure>
            </>,
        )

        const ids = screen.getAllByRole('button').map((b) => b.getAttribute('aria-controls'))
        expect(ids.every(Boolean)).toBe(true)
        expect(new Set(ids).size).toBe(ids.length)
        ids.forEach((id) => expect(document.getElementById(id!)).not.toBeNull())
    })
})
