import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {Stepper} from '../Stepper'

const steps = [
    {id: 'one', label: 'One'},
    {id: 'two', label: 'Two'},
    {id: 'three', label: 'Three'},
]

describe('Stepper', () => {
    it('renders a progress nav with every step label', () => {
        render(<Stepper steps={steps} activeStep={0}/>)

        const nav = screen.getByRole('navigation', {name: 'Progress'})
        expect(nav).toBeInTheDocument()
        expect(screen.getByText('One')).toBeInTheDocument()
        expect(screen.getByText('Two')).toBeInTheDocument()
        expect(screen.getByText('Three')).toBeInTheDocument()
    })

    it('marks the active step with aria-current="step"', () => {
        render(<Stepper steps={steps} activeStep={1}/>)

        const items = screen.getAllByRole('listitem')
        expect(items[1]).toHaveAttribute('aria-current', 'step')
        expect(items[0]).not.toHaveAttribute('aria-current')
        expect(items[2]).not.toHaveAttribute('aria-current')
    })

    it('fires onStepClick for a completed step', async () => {
        const user = userEvent.setup()
        const onStepClick = vi.fn()
        render(<Stepper steps={steps} activeStep={2} onStepClick={onStepClick}/>)

        await user.click(screen.getByRole('button', {name: /One/}))

        expect(onStepClick).toHaveBeenCalledWith(0)
    })

    it('never makes the active or upcoming steps clickable', () => {
        render(<Stepper steps={steps} activeStep={1} onStepClick={vi.fn()}/>)

        // Only the completed step (index 0) is a button.
        expect(screen.getAllByRole('button')).toHaveLength(1)
        expect(screen.getByRole('button', {name: /One/})).toBeInTheDocument()
    })

    it('renders no buttons without an onStepClick handler', () => {
        render(<Stepper steps={steps} activeStep={2}/>)

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
})
