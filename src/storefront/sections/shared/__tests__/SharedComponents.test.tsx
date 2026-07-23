import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { Section } from '../Section'
import { SectionHeading } from '../SectionHeading'
import { Carousel } from '../Carousel'

// ─── Section ────────────────────────────────────────────────────────────────

describe('Section', () => {
  it('renders a <section> with rhythm classes py-12 px-6 sm:px-8', () => {
    const { container } = render(<Section>Content</Section>)
    const section = container.querySelector('section')!
    expect(section).toBeInTheDocument()
    expect(section.className).toContain('py-12')
    expect(section.className).toContain('px-6')
    expect(section.className).toContain('sm:px-8')
  })

  it('contains inner mx-auto container with default width max-w-5xl', () => {
    const { container } = render(<Section>Content</Section>)
    const inner = container.querySelector('section > div')!
    expect(inner.className).toContain('mx-auto')
    expect(inner.className).toContain('max-w-5xl')
  })

  it('width="narrow" applies max-w-2xl', () => {
    const { container } = render(<Section width="narrow">Content</Section>)
    const inner = container.querySelector('section > div')!
    expect(inner.className).toContain('max-w-2xl')
  })

  it('width="wide" applies max-w-7xl', () => {
    const { container } = render(<Section width="wide">Content</Section>)
    const inner = container.querySelector('section > div')!
    expect(inner.className).toContain('max-w-7xl')
  })

  it('variant="dark" sets data-variant="dark" attribute', () => {
    const { container } = render(<Section variant="dark">Content</Section>)
    const section = container.querySelector('section')!
    expect(section).toHaveAttribute('data-variant', 'dark')
  })

  it('dark variant has inline style with gradient background', () => {
    const { container } = render(<Section variant="dark">Content</Section>)
    const section = container.querySelector('section')!
    expect(section.style.background).toContain('radial-gradient')
    expect(section.style.background).toContain('#121212')
  })

  it('light variant (default) does NOT have data-variant attribute', () => {
    const { container } = render(<Section>Content</Section>)
    const section = container.querySelector('section')!
    expect(section).not.toHaveAttribute('data-variant')
  })

  it('className prop merges onto the section element', () => {
    const { container } = render(<Section className="custom-class">Content</Section>)
    const section = container.querySelector('section')!
    expect(section.className).toContain('custom-class')
    expect(section.className).toContain('py-12')
  })
})

// ─── SectionHeading ─────────────────────────────────────────────────────────

describe('SectionHeading', () => {
  it('renders <h2> with title text', () => {
    render(<SectionHeading title="Hello World" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Hello World')
  })

  it('renders eyebrow with uppercase text and accent dash when provided', () => {
    const { container } = render(<SectionHeading eyebrow="Featured" title="Title" />)
    const eyebrowEl = container.querySelector('p')!
    expect(eyebrowEl).toBeInTheDocument()
    expect(eyebrowEl.textContent).toContain('Featured')
    expect(eyebrowEl.className).toContain('uppercase')
    // Accent dash span
    const dash = eyebrowEl.querySelector('span')!
    expect(dash).toBeInTheDocument()
    expect(dash.className).toContain('bg-(--sf-accent)')
  })

  it('does not render eyebrow element when eyebrow is absent', () => {
    const { container } = render(<SectionHeading title="Title" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(0)
  })

  it('renders subtitle as muted text when provided', () => {
    const { container } = render(<SectionHeading title="Title" subtitle="Some description" />)
    const paragraphs = container.querySelectorAll('p')
    const subtitle = Array.from(paragraphs).find(p => p.textContent === 'Some description')!
    expect(subtitle).toBeInTheDocument()
    expect(subtitle.className).toContain('text-(--sf-muted-text)')
  })

  it('does not render subtitle element when subtitle is absent', () => {
    const { container } = render(<SectionHeading title="Title" />)
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs.length).toBe(0)
  })

  it('accent underline rule always renders', () => {
    const { container } = render(<SectionHeading title="Title" />)
    const rule = container.querySelector('span[aria-hidden="true"]')!
    expect(rule).toBeInTheDocument()
    expect(rule.className).toContain('bg-(--sf-accent)')
  })
})

// ─── Carousel ───────────────────────────────────────────────────────────────

describe('Carousel', () => {
  let resizeObserverCallback: ResizeObserverCallback
  let originalResizeObserver: typeof ResizeObserver

  beforeEach(() => {
    originalResizeObserver = globalThis.ResizeObserver
    globalThis.ResizeObserver = class MockResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        resizeObserverCallback = cb
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  })

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver
  })

  it('renders with role="region" and the provided aria-label', () => {
    render(<Carousel ariaLabel="Testimonials carousel"><div>Card 1</div></Carousel>)
    const region = screen.getByRole('region')
    expect(region).toHaveAttribute('aria-label', 'Testimonials carousel')
  })

  it('children are wrapped in snap-aligned cells (snap-start shrink-0)', () => {
    render(
      <Carousel ariaLabel="Test">
        <div>Card 1</div>
        <div>Card 2</div>
      </Carousel>
    )
    const region = screen.getByRole('region')
    const scrollContainer = region.querySelector('[class*="snap-x"]')!
    const cells = scrollContainer.querySelectorAll('[class*="snap-start"]')
    expect(cells.length).toBe(2)
    cells.forEach(cell => {
      expect(cell.className).toContain('snap-start')
      expect(cell.className).toContain('shrink-0')
    })
  })

  it('scroll container has snap-x snap-mandatory classes', () => {
    render(<Carousel ariaLabel="Test"><div>Card</div></Carousel>)
    const region = screen.getByRole('region')
    const scrollContainer = region.querySelector('[class*="snap-x"]')!
    expect(scrollContainer.className).toContain('snap-x')
    expect(scrollContainer.className).toContain('snap-mandatory')
  })

  it('buttons are hidden by default (jsdom scrollWidth=0, clientWidth=0 — no overflow)', () => {
    render(<Carousel ariaLabel="Test"><div>Card</div></Carousel>)
    expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next')).not.toBeInTheDocument()
  })

  it('when overflow detected (scrollWidth > clientWidth), prev/next buttons appear', () => {
    render(
      <Carousel ariaLabel="Test">
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </Carousel>
    )
    const region = screen.getByRole('region')
    const scrollContainer = region.querySelector('[class*="snap-x"]')! as HTMLElement

    // Mock overflow dimensions
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1200, configurable: true })
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true })

    // Trigger the ResizeObserver callback to re-check overflow
    act(() => {
      resizeObserverCallback([], {} as ResizeObserver)
    })

    expect(screen.getByLabelText('Previous')).toBeInTheDocument()
    expect(screen.getByLabelText('Next')).toBeInTheDocument()
  })

  it('when no overflow (scrollWidth <= clientWidth), buttons are hidden', () => {
    render(
      <Carousel ariaLabel="Test">
        <div>Card 1</div>
      </Carousel>
    )
    const region = screen.getByRole('region')
    const scrollContainer = region.querySelector('[class*="snap-x"]')! as HTMLElement

    // Mock no overflow
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 400, configurable: true })
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true })

    act(() => {
      resizeObserverCallback([], {} as ResizeObserver)
    })

    expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next')).not.toBeInTheDocument()
  })

  it('clicking prev button calls scrollBy with negative left value', () => {
    render(
      <Carousel ariaLabel="Test">
        <div>Card 1</div>
        <div>Card 2</div>
      </Carousel>
    )
    const region = screen.getByRole('region')
    const scrollContainer = region.querySelector('[class*="snap-x"]')! as HTMLElement

    // Mock overflow
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1200, configurable: true })
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true })
    scrollContainer.scrollBy = vi.fn()

    act(() => {
      resizeObserverCallback([], {} as ResizeObserver)
    })

    fireEvent.click(screen.getByLabelText('Previous'))
    expect(scrollContainer.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: expect.any(Number) })
    )
    const call = (scrollContainer.scrollBy as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.left).toBeLessThan(0)
  })

  it('clicking next button calls scrollBy with positive left value', () => {
    render(
      <Carousel ariaLabel="Test">
        <div>Card 1</div>
        <div>Card 2</div>
      </Carousel>
    )
    const region = screen.getByRole('region')
    const scrollContainer = region.querySelector('[class*="snap-x"]')! as HTMLElement

    // Mock overflow
    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1200, configurable: true })
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true })
    scrollContainer.scrollBy = vi.fn()

    act(() => {
      resizeObserverCallback([], {} as ResizeObserver)
    })

    fireEvent.click(screen.getByLabelText('Next'))
    expect(scrollContainer.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: expect.any(Number) })
    )
    const call = (scrollContainer.scrollBy as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(call.left).toBeGreaterThan(0)
  })

  it('buttons have correct aria-labels ("Previous", "Next")', () => {
    render(
      <Carousel ariaLabel="Test">
        <div>Card 1</div>
        <div>Card 2</div>
      </Carousel>
    )
    const region = screen.getByRole('region')
    const scrollContainer = region.querySelector('[class*="snap-x"]')! as HTMLElement

    Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1200, configurable: true })
    Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true })

    act(() => {
      resizeObserverCallback([], {} as ResizeObserver)
    })

    const prev = screen.getByLabelText('Previous')
    const next = screen.getByLabelText('Next')
    expect(prev).toHaveAttribute('aria-label', 'Previous')
    expect(next).toHaveAttribute('aria-label', 'Next')
  })
})
