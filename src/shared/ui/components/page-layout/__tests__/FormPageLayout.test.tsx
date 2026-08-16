import {describe, expect, it, vi} from 'vitest'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {FormPageLayout} from '../FormPageLayout'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {...actual, useNavigate: () => mockNavigate}
})

function renderLayout(props: Partial<React.ComponentProps<typeof FormPageLayout>> = {}) {
    return render(
        <MemoryRouter>
            <FormPageLayout title="Edit Brand" {...props}>
                <div>form content</div>
            </FormPageLayout>
        </MemoryRouter>,
    )
}

describe('FormPageLayout', () => {
    it('renders the title as a heading', () => {
        renderLayout()

        expect(screen.getByRole('heading', {name: 'Edit Brand'})).toBeInTheDocument()
    })

    it('renders a back button above the title', () => {
        renderLayout()

        expect(screen.getByRole('button', {name: /back/i})).toBeInTheDocument()
    })

    it('navigates back when the back button is clicked', () => {
        renderLayout()

        screen.getByRole('button', {name: /back/i}).click()

        expect(mockNavigate).toHaveBeenCalledWith(-1)
    })

    it('renders children below the header', () => {
        renderLayout()

        expect(screen.getByText('form content')).toBeInTheDocument()
    })

    it('renders an optional subtitle', () => {
        renderLayout({subtitle: 'Editing Acme Corp'})

        expect(screen.getByText('Editing Acme Corp')).toBeInTheDocument()
    })

    it('omits the subtitle paragraph when none is given', () => {
        renderLayout()

        expect(screen.queryByText('Editing Acme Corp')).not.toBeInTheDocument()
    })
})
