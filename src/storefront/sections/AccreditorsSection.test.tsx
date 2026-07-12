import { render, screen } from '@testing-library/react'
import { AccreditorsSection } from './AccreditorsSection'
import type { AccreditorsSectionConfig } from '@/shared/types/StorefrontConfig'

vi.mock('@/shared/utils/imageUrl', () => ({
  resolveImageUrl: (path: string | null | undefined) => path ? `/static/images/${path}` : null,
}))

function buildSection(overrides: Partial<AccreditorsSectionConfig['props']> = {}): AccreditorsSectionConfig {
  return {
    id: 'accreditors-1',
    type: 'accreditors',
    props: {
      items: [
        { id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png', url: 'https://sabs.co.za' },
        { id: '2', name: 'SAHPRA', logoUrl: 'accreditors/sahpra.png' },
        { id: '3', name: 'Safripol', logoUrl: 'accreditors/safripol.png', url: 'https://safripol.com' },
      ],
      ...overrides,
    },
  }
}

describe('AccreditorsSection', () => {
  it('renders heading when provided', () => {
    const section = buildSection({ heading: 'Our Accreditations' })
    render(<AccreditorsSection section={section} />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Our Accreditations')
  })

  it('renders correct number of logos', () => {
    const section = buildSection()
    render(<AccreditorsSection section={section} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
  })

  it('logo with url is wrapped in anchor with target="_blank" and rel="noopener noreferrer"', () => {
    const section = buildSection({
      items: [{ id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png', url: 'https://sabs.co.za' }],
    })
    render(<AccreditorsSection section={section} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://sabs.co.za')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('logo without url is not wrapped in anchor', () => {
    const section = buildSection({
      items: [{ id: '2', name: 'SAHPRA', logoUrl: 'accreditors/sahpra.png' }],
    })
    render(<AccreditorsSection section={section} />)

    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('returns null when items is empty', () => {
    const section = buildSection({ items: [] })
    const { container } = render(<AccreditorsSection section={section} />)

    expect(container.innerHTML).toBe('')
  })

  it('logo alt matches item name', () => {
    const section = buildSection({
      items: [
        { id: '1', name: 'SABS', logoUrl: 'accreditors/sabs.png' },
        { id: '2', name: 'SAHPRA', logoUrl: 'accreditors/sahpra.png' },
      ],
    })
    render(<AccreditorsSection section={section} />)

    expect(screen.getByAltText('SABS')).toBeInTheDocument()
    expect(screen.getByAltText('SAHPRA')).toBeInTheDocument()
  })
})
