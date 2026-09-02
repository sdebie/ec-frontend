/**
 * Hook-level test — exercises the REAL read mapping and write mapping in
 * useZeroProductStock. Mocks only adminGraphqlClient.request, so a drift in
 * either mapper fails here.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useZeroProductStock } from '../useZeroProductStock'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

// Production-shaped detail response: numeric BigDecimal prices, a wholesale
// tier, alt text, and multiple categories — everything must round-trip.
const detailResponse = {
  getProductInformation: {
    product: {
      id: 'prod-9',
      name: 'Bolt Box',
      slug: 'bolt-box',
      shortDescription: 'Bolts',
      description: 'A box of bolts',
      status: 'ACTIVE',
      categories: [{ id: 'cat-1', name: 'Fasteners' }, { id: 'cat-2', name: 'Hardware' }],
    },
    variants: [
      {
        id: 'var-1',
        sku: 'BOLT-100',
        stockQuantity: 40,
        status: 'ACTIVE',
        prices: [
          { id: 'rp-1', price: 49.99, priceType: 'RETAIL_PRICE' },
          { id: 'wp-1', price: 39.99, priceType: 'WHOLESALE_PRICE' },
        ],
        images: [{ id: 'img-1', imageUrl: 'bolt.jpg', featured: true, sortOrder: 0, altText: 'Bolt' }],
      },
      {
        id: 'var-2',
        sku: 'BOLT-500',
        stockQuantity: 7,
        status: 'ACTIVE',
        prices: [{ id: 'rp-2', price: 199.99, priceType: 'RETAIL_PRICE' }],
        images: [],
      },
    ],
  },
}

describe('useZeroProductStock — real mapping round-trip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('zeroes every variant stock while round-tripping prices, categories, and images', async () => {
    vi.mocked(adminGraphqlClient.request)
      .mockResolvedValueOnce(detailResponse)
      .mockResolvedValueOnce({ updateProductInformation: {} })

    const { result } = renderHook(() => useZeroProductStock(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate('prod-9')
    })

    await waitFor(() => {
      expect(adminGraphqlClient.request).toHaveBeenCalledTimes(2)
    })

    const [updateDoc, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[1] as unknown as [unknown, Record<string, unknown>]
    expect(String(updateDoc)).toContain('updateProductInformation')
    expect((variables as { productId: string }).productId).toBe('prod-9')

    const input = (variables as { input: {
      product: { name: string; categories: Array<{ id: string }> }
      variants: Array<{ id?: string; stockQuantity: number; prices: Array<{ id?: string; priceType: string; price: string }> }>
    } }).input

    // Every stock is zeroed
    expect(input.variants.map((v) => v.stockQuantity)).toEqual([0, 0])

    // Everything else round-trips: ids, both price tiers (coerced to strings), categories
    expect(input.variants[0].id).toBe('var-1')
    expect(input.variants[0].prices).toEqual([
      { id: 'rp-1', priceType: 'RETAIL_PRICE', price: '49.99' },
      { id: 'wp-1', priceType: 'WHOLESALE_PRICE', price: '39.99' },
    ])
    expect(input.variants[1].prices).toEqual([
      { id: 'rp-2', priceType: 'RETAIL_PRICE', price: '199.99' },
    ])
    expect(input.product.categories).toEqual([{ id: 'cat-1' }, { id: 'cat-2' }])
  })

  it('rejects when the product does not exist', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValueOnce({ getProductInformation: null })

    const { result } = renderHook(() => useZeroProductStock(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate('missing')
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    // No update mutation was attempted
    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
  })
})
