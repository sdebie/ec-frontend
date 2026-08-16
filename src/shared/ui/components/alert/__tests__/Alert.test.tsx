import {describe, expect, it} from 'vitest'
import {render, screen} from '@testing-library/react'
import {Alert} from '../Alert'

describe('Alert', () => {
    it('renders the title and description', () => {
        render(<Alert title="Review before proceeding" description="Please verify all the information."/>)

        expect(screen.getByText('Review before proceeding')).toBeInTheDocument()
        expect(screen.getByText('Please verify all the information.')).toBeInTheDocument()
    })

    it('accepts a ReactNode description, not just plain text', () => {
        render(<Alert title="Heads up" description={<span>Custom <strong>content</strong></span>}/>)

        expect(screen.getByText('Custom')).toBeInTheDocument()
        expect(screen.getByText('content')).toBeInTheDocument()
    })
})
