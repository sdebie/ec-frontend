import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Thumbnail } from './Thumbnail'

describe('Thumbnail', () => {
  it('resolves a storage-relative DB path to the static image URL', () => {
    render(<Thumbnail logoUrl="images/01/foo.png" name="Acme" />)
    expect(screen.getByRole('img', { name: 'Acme logo' })).toHaveAttribute(
      'src',
      '/static/images/images/01/foo.png'
    )
  })

  it('passes an absolute http URL through unchanged', () => {
    render(<Thumbnail logoUrl="https://cdn.example.com/logo.png" name="Acme" />)
    expect(screen.getByRole('img', { name: 'Acme logo' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/logo.png'
    )
  })

  it('passes an already-resolved /static/images path through unchanged', () => {
    render(<Thumbnail logoUrl="/static/images/images/01/foo.png" name="Acme" />)
    expect(screen.getByRole('img', { name: 'Acme logo' })).toHaveAttribute(
      'src',
      '/static/images/images/01/foo.png'
    )
  })

  it('renders initials when no logoUrl is given', () => {
    render(<Thumbnail logoUrl={null} name="Acme" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('AC')).toBeInTheDocument()
  })

  it('falls back to initials when the image fails to load', () => {
    render(<Thumbnail logoUrl="images/01/broken.png" name="Acme" />)
    fireEvent.error(screen.getByRole('img', { name: 'Acme logo' }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('AC')).toBeInTheDocument()
  })
})
