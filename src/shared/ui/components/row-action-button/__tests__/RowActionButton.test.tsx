import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RowActionButton } from '../RowActionButton'

describe('RowActionButton', () => {
  it('renders a native button with its icon children by default', () => {
    render(
      <RowActionButton aria-label="Edit">
        <svg data-testid="icon" />
      </RowActionButton>,
    )

    const button = screen.getByRole('button', { name: 'Edit' })
    expect(button).toHaveAttribute('type', 'button')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <RowActionButton aria-label="Delete" onClick={onClick}>
        <svg />
      </RowActionButton>,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('forwards data-testid, title and disabled to the underlying button', () => {
    render(
      <RowActionButton aria-label="Archive" data-testid="action-archive" title="Archive product" disabled>
        <svg />
      </RowActionButton>,
    )

    const button = screen.getByTestId('action-archive')
    expect(button).toHaveAttribute('title', 'Archive product')
    expect(button).toBeDisabled()
  })

  it('defaults to the accent hover treatment', () => {
    render(
      <RowActionButton aria-label="Edit">
        <svg />
      </RowActionButton>,
    )

    const button = screen.getByRole('button', { name: 'Edit' })
    expect(button.className).toContain('text-(--c-text-muted)')
    expect(button.className).toContain('hover:bg-(--c-surface-hover)')
    expect(button.className).toContain('hover:text-(--c-accent)')
    expect(button.className).not.toContain('hover:text-(--c-danger)')
  })

  it('switches to the danger hover treatment for variant="danger"', () => {
    render(
      <RowActionButton aria-label="Delete" variant="danger">
        <svg />
      </RowActionButton>,
    )

    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('hover:text-(--c-danger)')
    expect(button.className).not.toContain('hover:text-(--c-accent)')
  })

  it('lets a caller override the base recipe via className (e.g. a persistent active-state color)', () => {
    render(
      <RowActionButton aria-label="Finish editing" className="text-(--c-accent)">
        <svg />
      </RowActionButton>,
    )

    const button = screen.getByRole('button', { name: 'Finish editing' })
    // tailwind-merge keeps the caller's override and drops the conflicting base utility
    expect(button.className).toContain('text-(--c-accent)')
    expect(button.className.match(/(?:^|\s)text-\(--c-text-muted\)/)).toBeNull()
  })

  it('renders as a <span> for as="span", for use as a DropdownMenu trigger', () => {
    render(
      <RowActionButton as="span" data-testid="kebab-trigger">
        <svg data-testid="icon" />
      </RowActionButton>,
    )

    const trigger = screen.getByTestId('kebab-trigger')
    expect(trigger.tagName).toBe('SPAN')
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('carries the same hover/variant classes in span mode', () => {
    render(
      <RowActionButton as="span" data-testid="kebab-trigger">
        <svg />
      </RowActionButton>,
    )

    const trigger = screen.getByTestId('kebab-trigger')
    expect(trigger.className).toContain('hover:bg-(--c-surface-hover)')
    expect(trigger.className).toContain('hover:text-(--c-accent)')
  })
})
