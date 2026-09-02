import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IconText } from '../IconText'

describe('IconText', () => {
  it('renders icon and text content', () => {
    render(
      <IconText icon={<svg data-testid="icon" />}>
        Hello world
      </IconText>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders a span by default', () => {
    const { container } = render(
      <IconText icon={<svg />}>Label</IconText>
    )
    expect(container.firstElementChild!.tagName).toBe('SPAN')
  })

  it('respects `as` element (renders <div> when as="div")', () => {
    const { container } = render(
      <IconText icon={<svg />} as="div">Label</IconText>
    )
    expect(container.firstElementChild!.tagName).toBe('DIV')
  })

  it('applies className to root alongside base classes', () => {
    const { container } = render(
      <IconText icon={<svg />} className="text-red-500">Label</IconText>
    )
    const el = container.firstElementChild!
    expect(el.className).toContain('text-red-500')
    expect(el.className).toContain('inline-flex')
    expect(el.className).toContain('items-center')
    expect(el.className).toContain('gap-2')
  })

  it('wraps the icon in a shrink-0 span', () => {
    render(
      <IconText icon={<svg data-testid="icon" />}>Label</IconText>
    )
    const iconWrapper = screen.getByTestId('icon').parentElement!
    expect(iconWrapper.tagName).toBe('SPAN')
    expect(iconWrapper.className).toContain('shrink-0')
  })
})
