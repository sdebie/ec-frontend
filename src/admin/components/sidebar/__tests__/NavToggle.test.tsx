import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { NavToggle } from '../NavToggle'

describe('NavToggle', () => {
  it('renders ChevronsRight icon when toggled=true', () => {
    const { container } = render(<NavToggle toggled={true} onToggle={() => {}} />)
    const svg = container.querySelector('svg')!
    // ChevronsRight has two polyline elements pointing right
    expect(svg).toBeTruthy()
    expect(container.querySelector('button')!.getAttribute('title')).toBe('Expand sidebar')
  })

  it('renders ChevronsLeft icon when toggled=false', () => {
    const { container } = render(<NavToggle toggled={false} onToggle={() => {}} />)
    const svg = container.querySelector('svg')!
    expect(svg).toBeTruthy()
    expect(container.querySelector('button')!.getAttribute('title')).toBe('Collapse sidebar')
  })

  it('calls onToggle on click', () => {
    const onToggle = vi.fn()
    render(<NavToggle toggled={false} onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('has title "Expand sidebar" when toggled=true', () => {
    render(<NavToggle toggled={true} onToggle={() => {}} />)
    expect(screen.getByTitle('Expand sidebar')).toBeTruthy()
  })

  it('has title "Collapse sidebar" when toggled=false', () => {
    render(<NavToggle toggled={false} onToggle={() => {}} />)
    expect(screen.getByTitle('Collapse sidebar')).toBeTruthy()
  })
})
