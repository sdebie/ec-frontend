import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from './Drawer'

describe('Drawer', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <Drawer open={false} onClose={vi.fn()}>
        <div>Content</div>
      </Drawer>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders children when open is true', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <div>Drawer content</div>
      </Drawer>
    )
    expect(screen.getByText('Drawer content')).toBeInTheDocument()
  })

  it('renders with role="dialog" and aria-modal="true"', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <div>Content</div>
      </Drawer>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('slides in from the right by default', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <div>Content</div>
      </Drawer>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('right-0')
    expect(dialog.className).toContain('slide-in-from-right')
  })

  it('slides in from the left when position="left"', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} position="left">
        <div>Content</div>
      </Drawer>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('left-0')
    expect(dialog.className).toContain('slide-in-from-left')
  })

  it('renders a backdrop overlay', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <div>Content</div>
      </Drawer>
    )
    const backdrop = document.querySelector('[aria-hidden="true"]')
    expect(backdrop).toBeInTheDocument()
    expect(backdrop?.className).toContain('fixed')
    expect(backdrop?.className).toContain('inset-0')
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    )
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses --c-panel for background (no hardcoded colours)', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <div>Content</div>
      </Drawer>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('bg-(--c-panel)')
  })

  it('applies size class based on size prop', () => {
    render(
      <Drawer open={true} onClose={vi.fn()} size="lg">
        <div>Content</div>
      </Drawer>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('max-w-lg')
  })
})

describe('DrawerHeader', () => {
  it('renders title text', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerHeader title="My Title" />
      </Drawer>
    )
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerHeader title="Title" description="A description" />
      </Drawer>
    )
    expect(screen.getByText('A description')).toBeInTheDocument()
  })

  it('renders a close button that calls onClose', () => {
    const onClose = vi.fn()
    render(
      <Drawer open={true} onClose={onClose}>
        <DrawerHeader title="Title" />
      </Drawer>
    )
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('DrawerContent', () => {
  it('renders children with overflow-y-auto', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerContent>
          <p>Body content</p>
        </DrawerContent>
      </Drawer>
    )
    expect(screen.getByText('Body content')).toBeInTheDocument()
    const content = screen.getByText('Body content').parentElement
    expect(content?.className).toContain('overflow-y-auto')
  })
})

describe('DrawerFooter', () => {
  it('renders children with border-t', () => {
    render(
      <Drawer open={true} onClose={vi.fn()}>
        <DrawerFooter>
          <button>Save</button>
        </DrawerFooter>
      </Drawer>
    )
    expect(screen.getByText('Save')).toBeInTheDocument()
    const footer = screen.getByText('Save').parentElement
    expect(footer?.className).toContain('border-t')
  })
})
