import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '../Skeleton'

describe('Skeleton', () => {
  describe('Skeleton.Bar', () => {
    it('renders animate-pulse and bg-(--c-border) classes', () => {
      const { container } = render(<Skeleton.Bar />)
      const el = container.firstElementChild!
      expect(el.className).toContain('animate-pulse')
      expect(el.className).toContain('bg-(--c-border)')
    })

    it('applies default height of h-4', () => {
      const { container } = render(<Skeleton.Bar />)
      const el = container.firstElementChild!
      expect(el.className).toContain('h-4')
    })

    it('accepts and applies width override', () => {
      const { container } = render(<Skeleton.Bar width="w-32" />)
      const el = container.firstElementChild!
      expect(el.className).toContain('w-32')
    })

    it('accepts and applies height override', () => {
      const { container } = render(<Skeleton.Bar height="h-8" />)
      const el = container.firstElementChild!
      expect(el.className).toContain('h-8')
      expect(el.className).not.toContain('h-4')
    })
  })

  describe('Skeleton.Circle', () => {
    it('renders animate-pulse and bg-(--c-border) classes', () => {
      const { container } = render(<Skeleton.Circle />)
      const el = container.firstElementChild!
      expect(el.className).toContain('animate-pulse')
      expect(el.className).toContain('bg-(--c-border)')
    })

    it('applies default size of h-10 w-10', () => {
      const { container } = render(<Skeleton.Circle />)
      const el = container.firstElementChild!
      expect(el.className).toContain('h-10 w-10')
    })

    it('accepts and applies size override', () => {
      const { container } = render(<Skeleton.Circle size="h-16 w-16" />)
      const el = container.firstElementChild!
      expect(el.className).toContain('h-16 w-16')
      expect(el.className).not.toContain('h-10 w-10')
    })
  })

  describe('Skeleton.Rect', () => {
    it('renders animate-pulse and bg-(--c-border) classes', () => {
      const { container } = render(<Skeleton.Rect />)
      const el = container.firstElementChild!
      expect(el.className).toContain('animate-pulse')
      expect(el.className).toContain('bg-(--c-border)')
    })

    it('accepts and applies arbitrary className', () => {
      const { container } = render(<Skeleton.Rect className="h-24 w-full aspect-square" />)
      const el = container.firstElementChild!
      expect(el.className).toContain('h-24')
      expect(el.className).toContain('w-full')
      expect(el.className).toContain('aspect-square')
    })
  })
})
