import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { RichTextEditor } from '../RichTextEditor'

describe('RichTextEditor', () => {
  let onChange: ReturnType<typeof vi.fn<(html: string) => void>>

  beforeEach(() => {
    onChange = vi.fn<(html: string) => void>()
  })

  it('renders the toolbar with all expected buttons', () => {
    render(<RichTextEditor value="" onChange={onChange} />)

    expect(screen.getByTitle('Heading 1')).toBeInTheDocument()
    expect(screen.getByTitle('Heading 2')).toBeInTheDocument()
    expect(screen.getByTitle('Heading 3')).toBeInTheDocument()
    expect(screen.getByTitle('Bold')).toBeInTheDocument()
    expect(screen.getByTitle('Italic')).toBeInTheDocument()
    expect(screen.getByTitle('Underline')).toBeInTheDocument()
    expect(screen.getByTitle('Ordered List')).toBeInTheDocument()
    expect(screen.getByTitle('Unordered List')).toBeInTheDocument()
    expect(screen.getByTitle('Add Link')).toBeInTheDocument()
    expect(screen.getByTitle('Remove Link')).toBeInTheDocument()
  })

  it('renders editor content area', () => {
    const { container } = render(
      <RichTextEditor value="<p>Hello world</p>" onChange={onChange} />
    )

    // TipTap renders content in a contenteditable div via .tiptap class
    const editorContent = container.querySelector('.tiptap')
    expect(editorContent).toBeInTheDocument()
  })

  it('applies disabled styling when disabled is true', () => {
    const { container } = render(
      <RichTextEditor value="" onChange={onChange} disabled />
    )

    // The outer wrapper should have disabled styling
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-60')
    expect(wrapper.className).toContain('pointer-events-none')
  })

  it('disables toolbar buttons when disabled', () => {
    render(<RichTextEditor value="" onChange={onChange} disabled />)

    const boldButton = screen.getByTitle('Bold')
    expect(boldButton).toBeDisabled()
  })

  it('renders with admin theme tokens (border and panel classes)', () => {
    const { container } = render(
      <RichTextEditor value="" onChange={onChange} />
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('border-(--c-border)')
    expect(wrapper.className).toContain('bg-(--c-panel)')
  })

  it('calls window.prompt when Add Link button is clicked', () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null)

    render(<RichTextEditor value="<p>Some text</p>" onChange={onChange} />)

    const linkButton = screen.getByTitle('Add Link')
    fireEvent.click(linkButton)

    expect(promptSpy).toHaveBeenCalled()
    promptSpy.mockRestore()
  })
})
