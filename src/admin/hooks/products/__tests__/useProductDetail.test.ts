/**
 * Feature: admin-product-write, Task 6.1
 * Hook-level test — exercises the REAL request mapping in useProductDetail.
 * Mocks only the boundary (adminGraphqlClient.request), not the hook itself.
 *
 * Validates: Requirements 1.3, 8.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useProductDetail } from '../useProductDetail'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useProductDetail — real mapping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps GraphQL response to AdminProductDetail (stockQuantity→stock, RETAIL_PRICE→price, images flattened)', async () => {
    const graphqlResponse = {
      getProductInformation: {
        product: {
          id: 'prod-1',
          name: 'Widget Pro',
          slug: 'widget-pro',
          shortDescription: 'A pro widget',
          description: 'Full description',
          status: 'ACTIVE',
          categories: [{ id: 'cat-1', name: 'Electronics' }],
        },
        variants: [
          {
            id: 'var-1',
            sku: 'WDG-001',
            stockQuantity: 42,
            status: 'ACTIVE',
            attributesJson: '{"Colour":"Navy","Size":"L"}',
            prices: [
              { id: 'price-1', price: 29.99, priceType: 'RETAIL_PRICE' },
              { id: 'price-2', price: 19.99, priceType: 'SALE_PRICE' },
            ],
            images: [
              { id: 'img-1', imageUrl: 'hero.jpg', featured: true, sortOrder: 0, altText: 'Hero shot' },
              { id: 'img-2', imageUrl: 'side.jpg', featured: false, sortOrder: 1, altText: null },
            ],
          },
          {
            id: 'var-2',
            sku: 'WDG-002',
            stockQuantity: 10,
            status: 'ACTIVE',
            attributesJson: null,
            prices: [
              { id: 'price-3', price: 39.99, priceType: 'RETAIL_PRICE' },
            ],
            images: [
              { id: 'img-3', imageUrl: 'other.jpg', featured: false, sortOrder: 2 },
            ],
          },
        ],
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(graphqlResponse)

    const { result } = renderHook(() => useProductDetail('prod-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const detail = result.current.data!

    // Product scalar fields
    expect(detail.id).toBe('prod-1')
    expect(detail.name).toBe('Widget Pro')
    expect(detail.slug).toBe('widget-pro')
    expect(detail.status).toBe('ACTIVE')
    expect(detail.categories).toEqual([{ id: 'cat-1', name: 'Electronics' }])

    // Variant mapping: stockQuantity → stock, RETAIL_PRICE → price
    expect(detail.variants).toHaveLength(2)
    // The wire carries BigDecimal NUMBERS; the form model requires strings —
    // the mapping must coerce, or zod rejects every server-loaded variant.
    // attributesJson is parsed into ordered {key, value} rows for the form.
    expect(detail.variants[0]).toEqual({
      id: 'var-1',
      priceId: 'price-1',
      sku: 'WDG-001',
      price: '29.99',
      stock: 42,
      attributes: [{ key: 'Colour', value: 'Navy' }, { key: 'Size', value: 'L' }],
    })
    expect(detail.variants[1]).toEqual({
      id: 'var-2',
      priceId: 'price-3',
      sku: 'WDG-002',
      price: '39.99',
      stock: 10,
      attributes: [],
    })

    // Images flattened from all variants, sorted by sortOrder, deduplicated;
    // absent/null alt text normalises to ''
    expect(detail.images).toEqual([
      { url: 'hero.jpg', altText: 'Hero shot' },
      { url: 'side.jpg', altText: '' },
      { url: 'other.jpg', altText: '' },
    ])
    expect(detail.imageIds).toEqual({
      'hero.jpg': 'img-1',
      'side.jpg': 'img-2',
      'other.jpg': 'img-3',
    })

    // Not-found should be false
    expect(result.current.notFound).toBe(false)
  })

  it('filters out DISABLED variants from the form model', async () => {
    const graphqlResponse = {
      getProductInformation: {
        product: {
          id: 'prod-2',
          name: 'Disabled Test',
          slug: 'disabled-test',
          shortDescription: '',
          description: '',
          status: 'ACTIVE',
          categories: null,
        },
        variants: [
          {
            id: 'var-active',
            sku: 'ACT-001',
            stockQuantity: 5,
            status: 'ACTIVE',
            prices: [{ id: 'p1', price: 10.00, priceType: 'RETAIL_PRICE' }],
            images: [],
          },
          {
            id: 'var-disabled',
            sku: 'DIS-001',
            stockQuantity: 0,
            status: 'DISABLED',
            prices: [{ id: 'p2', price: 5.00, priceType: 'RETAIL_PRICE' }],
            images: [],
          },
        ],
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(graphqlResponse)

    const { result } = renderHook(() => useProductDetail('prod-2'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    // Only the active variant should appear
    expect(result.current.data!.variants).toHaveLength(1)
    expect(result.current.data!.variants[0].sku).toBe('ACT-001')
  })

  it('exposes notFound: true when getProductInformation returns null (Req 1.3)', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      getProductInformation: null,
    })

    const { result } = renderHook(() => useProductDetail('nonexistent-id'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.notFound).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('sends the query document containing getProductInformation to adminGraphqlClient', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      getProductInformation: null,
    })

    renderHook(() => useProductDetail('prod-x'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    })

    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
    expect(String(document)).toContain('getProductInformation')
    expect(variables).toEqual({ productId: 'prod-x' })
  })
})
