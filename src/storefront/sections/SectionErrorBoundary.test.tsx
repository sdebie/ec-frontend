import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionErrorBoundary } from './SectionErrorBoundary'

function ThrowingComponent(): never {
  throw new Error('Test error')
}

function GoodComponent() {
  return <p>I am fine</p>
}

describe('SectionErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders fallback when a child throws instead of crashing', () => {
    const { container } = render(
      <SectionErrorBoundary>
        <ThrowingComponent />
      </SectionErrorBoundary>
    )

    const fallback = container.querySelector('div.min-h-\\[100px\\].bg-gray-50')
    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveTextContent('')
  })

  it('calls console.error when an error is caught', () => {
    render(
      <SectionErrorBoundary>
        <ThrowingComponent />
      </SectionErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('does not affect sibling content outside the boundary', () => {
    render(
      <div>
        <SectionErrorBoundary>
          <ThrowingComponent />
        </SectionErrorBoundary>
        <GoodComponent />
      </div>
    )

    expect(screen.getByText('I am fine')).toBeInTheDocument()
  })
})
