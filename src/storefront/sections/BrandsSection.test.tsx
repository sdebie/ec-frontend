import { render, screen } from '@testing-library/react'
import type { BrandsSectionConfig } from '@/shared/types/StorefrontConfig'
import { BrandsSection } from './BrandsSection'
import { useBrands } from '@/storefront/catalog/hooks/useBrands'

vi.mock('@/shared/utils/imageUrl', () => ({
  resolveImageUrl: (path: string | null | undefined) =>
    path ? `/static/images/${path}` : null,
}))

vi.mock('@/storefront/catalog/hooks/useBrands', () => ({
  useBrands: vi.fn(),
}))

const mockedUseBrands = useBrands as ReturnType<typeof vi.fn>

function makeBrands(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `brand-${i + 1}`,
    name: `Brand ${i + 1}`,
    slug: `brand-${i + 1}`,
    logoUrl: `brands/brand-${i + 1}.png`,
  }))
}

function makeSection(
  props: Partial<BrandsSectionConfig['props']> = {},
): BrandsSectionConfig {
  return {
    id: 'brands-section',
    type: 'brands',
    props: {
      ...props,
    },
  }
}

describe('BrandsSection', () => {
  beforeEach(() => {
    mockedUseBrands.mockReturnValue({
      brands: makeBrands(4),
      isLoading: false,
      isError: false,
    })
  })

  it('renders heading when provided', () => {
    render(<BrandsSection section={makeSection({ heading: 'Our Brands' })} />)

    expect(
      screen.getByRole('heading', { name: 'Our Brands' }),
    ).toBeInTheDocument()
  })

  it('renders correct number of brand logos', () => {
    render(<BrandsSection section={makeSection()} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(4)
  })

  it('returns null when brands list is empty', () => {
    mockedUseBrands.mockReturnValue({
      brands: [],
      isLoading: false,
      isError: false,
    })

    const { container } = render(<BrandsSection section={makeSection()} />)
    expect(container.innerHTML).toBe('')
  })

  it('logo alt matches brand name', () => {
    render(<BrandsSection section={makeSection()} />)

    const images = screen.getAllByRole('img')
    images.forEach((img, i) => {
      expect(img).toHaveAttribute('alt', `Brand ${i + 1}`)
    })
  })

  it('respects limit prop — renders at most N logos', () => {
    mockedUseBrands.mockReturnValue({
      brands: makeBrands(6),
      isLoading: false,
      isError: false,
    })

    render(<BrandsSection section={makeSection({ limit: 3 })} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
  })
})
