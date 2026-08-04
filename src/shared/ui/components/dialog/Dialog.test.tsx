import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from './Dialog'

describe('Dialog', () => {
  afterEach(() => {
    // Clean up any scroll lock styles
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  })

  it('renders nothing when open is false', () => {
    const { container } = render(
      <Dialog open={false} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders dialog panel when open is true', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(
      <Dialog open={true} onClose={onClose}>
        <div>Content</div>
      </Dialog>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <Dialog open={true} onClose={onClose}>
        <div>Content</div>
      </Dialog>
    )
    const backdrop = document.querySelector('[aria-hidden="true"]')!
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when dialog panel is clicked', () => {
    const onClose = vi.fn()
    render(
      <Dialog open={true} onClose={onClose}>
        <div>Content</div>
      </Dialog>
    )
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks scroll on both documentElement and body when open', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('removes scroll lock when closed', () => {
    const { rerender } = render(
      <Dialog open={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )
    rerender(
      <Dialog open={false} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    )
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.body.style.overflow).toBe('')
  })

  describe('size prop', () => {
    it('applies max-w-md for sm size', () => {
      render(
        <Dialog open={true} onClose={() => {}} size="sm">
          <div>Content</div>
        </Dialog>
      )
      expect(screen.getByRole('dialog').className).toContain('max-w-md')
    })

    it('applies max-w-lg for md size (default)', () => {
      render(
        <Dialog open={true} onClose={() => {}}>
          <div>Content</div>
        </Dialog>
      )
      expect(screen.getByRole('dialog').className).toContain('max-w-lg')
    })

    it('applies max-w-2xl for lg size', () => {
      render(
        <Dialog open={true} onClose={() => {}} size="lg">
          <div>Content</div>
        </Dialog>
      )
      expect(screen.getByRole('dialog').className).toContain('max-w-2xl')
    })

    it('applies max-w-4xl for xl size', () => {
      render(
        <Dialog open={true} onClose={() => {}} size="xl">
          <div>Content</div>
        </Dialog>
      )
      expect(screen.getByRole('dialog').className).toContain('max-w-4xl')
    })

    it('applies full-screen width for full size', () => {
      render(
        <Dialog open={true} onClose={() => {}} size="full">
          <div>Content</div>
        </Dialog>
      )
      expect(screen.getByRole('dialog').className).toContain('max-w-[calc(100vw-10rem)]')
    })
  })
})

describe('DialogHeader', () => {
  it('renders title and close button', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <DialogHeader title="Test Title" />
      </Dialog>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <DialogHeader title="Title" description="Description text" />
      </Dialog>
    )
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <Dialog open={true} onClose={onClose}>
        <DialogHeader title="Title" />
      </Dialog>
    )
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('DialogContent', () => {
  it('renders children', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <DialogContent>
          <p>Dialog body</p>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Dialog body')).toBeInTheDocument()
  })
})

describe('DialogFooter', () => {
  it('renders children', () => {
    render(
      <Dialog open={true} onClose={() => {}}>
        <DialogFooter>
          <button>Save</button>
        </DialogFooter>
      </Dialog>
    )
    expect(screen.getByText('Save')).toBeInTheDocument()
  })
})

describe('portal rendering', () => {
  /** The overlay is the fixed element carrying the backdrop colour. */
  function overlayOf() {
    return document.body.querySelector('.fixed.inset-0') as HTMLElement
  }

  it('renders into document.body, not inside the caller subtree', () => {
    const { container } = render(
      <div data-testid="host">
        <Dialog open onClose={() => {}}>
          <DialogContent>body</DialogContent>
        </Dialog>
      </div>
    )

    // Nothing but the zero-size anchor stays behind at the call site.
    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(container.querySelector('.fixed.inset-0')).toBeNull()
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('leaves only a hidden anchor at the call site, which cannot take space-y margins', () => {
    const { container } = render(
      <div className="space-y-6">
        <p>sibling</p>
        <Dialog open onClose={() => {}}>
          <DialogContent>body</DialogContent>
        </Dialog>
      </div>
    )

    const anchor = container.querySelector('span[hidden]')
    expect(anchor).not.toBeNull()
    // Tailwind's space-y selector is `> :not([hidden]) ~ :not([hidden])`, so a
    // [hidden] anchor is excluded from the host page's spacing rhythm.
    expect(anchor).toHaveAttribute('hidden')
  })

  it('REGRESSION: the overlay is not a descendant of a space-y ancestor', () => {
    // The original defect: `space-y-6` applied margin-block-end to the fixed
    // overlay, shrinking it below the viewport and leaving an unblurred strip.
    // Structurally escaping that subtree is what makes it impossible.
    const { container } = render(
      <div className="space-y-6">
        <p>sibling</p>
        <Dialog open onClose={() => {}}>
          <DialogContent>body</DialogContent>
        </Dialog>
      </div>
    )

    const spaceY = container.querySelector('.space-y-6') as HTMLElement
    const overlay = overlayOf()
    expect(overlay).not.toBeNull()
    expect(spaceY.contains(overlay)).toBe(false)
  })

  it('copies surface/theme/preset/density from the ADMIN call site across the portal', () => {
    render(
      <div data-surface="admin" data-theme="dark" data-preset="blue" data-density="compact">
        <Dialog open onClose={() => {}}>
          <DialogContent>body</DialogContent>
        </Dialog>
      </div>
    )

    const portalRoot = (document.body.querySelector('[role="dialog"]') as HTMLElement)
      .closest('[data-surface]') as HTMLElement

    expect(portalRoot.getAttribute('data-surface')).toBe('admin')
    expect(portalRoot.getAttribute('data-theme')).toBe('dark')
    expect(portalRoot.getAttribute('data-preset')).toBe('blue')
    // Density is the load-bearing one: `--c-control-h-*` exists only under
    // [data-density], so losing it renders shared controls at height 0.
    expect(portalRoot.getAttribute('data-density')).toBe('compact')
  })

  it('copies the STOREFRONT surface and density across the portal', () => {
    render(
      <div data-surface="storefront" data-density="comfortable">
        <Dialog open onClose={() => {}}>
          <DialogContent>body</DialogContent>
        </Dialog>
      </div>
    )

    const portalRoot = (document.body.querySelector('[role="dialog"]') as HTMLElement)
      .closest('[data-surface]') as HTMLElement

    expect(portalRoot.getAttribute('data-surface')).toBe('storefront')
    expect(portalRoot.getAttribute('data-density')).toBe('comfortable')
  })

  it('resolves attributes from separate ancestors, not just the nearest element', () => {
    render(
      <div data-surface="admin" data-density="compact">
        <div data-theme="dark">
          <Dialog open onClose={() => {}}>
            <DialogContent>body</DialogContent>
          </Dialog>
        </div>
      </div>
    )

    const portalRoot = (document.body.querySelector('[role="dialog"]') as HTMLElement)
      .closest('[data-surface]') as HTMLElement

    expect(portalRoot.getAttribute('data-surface')).toBe('admin')
    expect(portalRoot.getAttribute('data-density')).toBe('compact')
    expect(portalRoot.getAttribute('data-theme')).toBe('dark')
  })
})
