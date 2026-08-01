import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterGroup } from '../FilterGroup'

describe('FilterGroup', () => {
  it('renders with title and collapsed body by default', () => {
    render(
      <FilterGroup title="Brand">
        <p>Brand content</p>
      </FilterGroup>
    )

    expect(screen.getByRole('button', { name: 'Brand' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Brand' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Brand content')).not.toBeInTheDocument()
  })

  it('renders expanded when defaultOpen is true', () => {
    render(
      <FilterGroup title="Category" defaultOpen>
        <p>Category content</p>
      </FilterGroup>
    )

    expect(screen.getByRole('button', { name: 'Category' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Category content')).toBeInTheDocument()
  })

  it('toggles body visibility when header is clicked', async () => {
    const user = userEvent.setup()

    render(
      <FilterGroup title="Brand">
        <p>Brand content</p>
      </FilterGroup>
    )

    const button = screen.getByRole('button', { name: 'Brand' })

    // Initially collapsed
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Brand content')).not.toBeInTheDocument()

    // Click to expand
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Brand content')).toBeInTheDocument()

    // Click to collapse
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Brand content')).not.toBeInTheDocument()
  })

  it('auto-expands when isActive is true regardless of defaultOpen', () => {
    render(
      <FilterGroup title="Brand" isActive>
        <p>Brand content</p>
      </FilterGroup>
    )

    expect(screen.getByRole('button', { name: 'Brand' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Brand content')).toBeInTheDocument()
  })

  it('stays expanded when both defaultOpen and isActive are true', () => {
    render(
      <FilterGroup title="Category" defaultOpen isActive>
        <p>Category content</p>
      </FilterGroup>
    )

    expect(screen.getByRole('button', { name: 'Category' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Category content')).toBeInTheDocument()
  })

  it('toggles with Enter key', async () => {
    const user = userEvent.setup()

    render(
      <FilterGroup title="Availability">
        <p>Availability content</p>
      </FilterGroup>
    )

    const button = screen.getByRole('button', { name: 'Availability' })
    button.focus()

    // Press Enter to expand
    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Availability content')).toBeInTheDocument()

    // Press Enter to collapse
    await user.keyboard('{Enter}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Availability content')).not.toBeInTheDocument()
  })

  it('toggles with Space key', async () => {
    const user = userEvent.setup()

    render(
      <FilterGroup title="Availability">
        <p>Availability content</p>
      </FilterGroup>
    )

    const button = screen.getByRole('button', { name: 'Availability' })
    button.focus()

    // Press Space to expand
    await user.keyboard(' ')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Availability content')).toBeInTheDocument()

    // Press Space to collapse
    await user.keyboard(' ')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Availability content')).not.toBeInTheDocument()
  })

  it('updates aria-expanded correctly on each toggle', async () => {
    const user = userEvent.setup()

    render(
      <FilterGroup title="Category" defaultOpen>
        <p>Category content</p>
      </FilterGroup>
    )

    const button = screen.getByRole('button', { name: 'Category' })

    // Starts expanded
    expect(button).toHaveAttribute('aria-expanded', 'true')

    // Collapse
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')

    // Expand again
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
