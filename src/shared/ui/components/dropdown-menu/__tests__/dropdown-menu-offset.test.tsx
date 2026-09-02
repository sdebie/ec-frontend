import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { DropdownMenu, DropdownItem } from '../DropdownMenu'

function mockTriggerRect() {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 200,
    height: 40,
    top: 100,
    left: 50,
    right: 250,
    bottom: 140,
    x: 50,
    y: 100,
    toJSON: () => {},
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  cleanup()
})

describe('DropdownMenu offset', () => {
  it('defaults to an 8px gap below the trigger (unchanged existing behavior)', () => {
    mockTriggerRect()

    const { container } = render(
      <DropdownMenu trigger={<span>Open</span>}>
        <DropdownItem onClick={() => {}}>Action</DropdownItem>
      </DropdownMenu>,
    )

    fireEvent.click(container.querySelector('button')!)

    const menuPanel = document.querySelector('[role="menu"]') as HTMLElement
    expect(menuPanel.style.top).toBe('148px') // 140 + 8
  })

  it('accepts a custom offset to tighten the gap for a wide, attached-looking trigger', () => {
    mockTriggerRect()

    const { container } = render(
      <DropdownMenu offset={4} trigger={<span>More actions</span>}>
        <DropdownItem onClick={() => {}}>Action</DropdownItem>
      </DropdownMenu>,
    )

    fireEvent.click(container.querySelector('button')!)

    const menuPanel = document.querySelector('[role="menu"]') as HTMLElement
    expect(menuPanel.style.top).toBe('144px') // 140 + 4
  })
})
