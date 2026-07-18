/**
 * Feature: admin-product-write, Task 6.1
 * Hook-level test — exercises the REAL mapping in useCreateProduct.
 * Mocks only adminGraphqlClient.request so the toProductInformationInput mapping
 * actually executes (if someone breaks the mapping, this test fails).
 *
 * Validates: Requirements 2.5, 8.2
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

vi.mock('@/shared/ui/components/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useCreateProduct } from '../useCreateProduct'
import type { ProductPayload } from '../useCreateProduct'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCreateProduct — real mapping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends addProductInformation mutation document to adminGraphqlClient', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      addProductInformation: {
        product: { id: 'new-1', name: 'Test', slug: 'test', status: 'PENDING' },
        variants: [],
      },
    })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() })

    const payload: ProductPayload = {
      name: 'Test',
      slug: 'test',
      shortDescription: 'Short',
      description: 'Long',
      status: 'PENDING' as ProductPayload['status'],
      categoryId: 'cat-1',
      images: [],
      variants: [{ sku: 'SKU-1', price: '19.99', stock: 5 }],
    }

    await act(async () => {
      result.current.mutate(payload)
    })

    await waitFor(() => {
      expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    })

    const [document] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
    expect(String(document)).toContain('addProductInformation')
    expect(String(document)).toContain('mutation')
  })

  it('maps form payload to ProductInformationDtoInput correctly (price→RETAIL_PRICE, stock→stockQuantity)', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      addProductInformation: {
        product: { id: 'new-1', name: 'Mapped', slug: 'mapped', status: 'ACTIVE' },
        variants: [{ id: 'v1', sku: 'M-001', stockQuantity: 10, prices: [], images: [] }],
      },
    })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() })

    const payload: ProductPayload = {
      name: 'Mapped Product',
      slug: 'mapped-product',
      shortDescription: 'A short desc',
      description: 'Full description',
      status: 'ACTIVE' as ProductPayload['status'],
      categoryId: 'cat-99',
      images: ['hero.jpg', 'detail.jpg'],
      variants: [
        { sku: 'M-001', price: '49.99', stock: 10 },
        { sku: 'M-002', price: '79.99', stock: 3 },
      ],
    }

    await act(async () => {
      result.current.mutate(payload)
    })

    await waitFor(() => {
      expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
    const input = (variables as { input: unknown }).input as {
      product: { name: string; categories: Array<{ id: string }> }
      variants: Array<{
        sku: string
        stockQuantity: number
        prices: Array<{ priceType: string; price: string }>
        images?: Array<{ imageUrl: string; isFeatured: boolean; sortOrder: number }>
      }>
    }

    // Product mapping
    expect(input.product.name).toBe('Mapped Product')
    expect(input.product.categories).toEqual([{ id: 'cat-99' }])

    // Variant 0: stock → stockQuantity, price → RETAIL_PRICE entry, images on index 0
    expect(input.variants[0].sku).toBe('M-001')
    expect(input.variants[0].stockQuantity).toBe(10)
    expect(input.variants[0].prices).toEqual([
      { priceType: 'RETAIL_PRICE', price: '49.99' },
    ])
    expect(input.variants[0].images).toEqual([
      { imageUrl: 'hero.jpg', isFeatured: true, sortOrder: 0 },
      { imageUrl: 'detail.jpg', isFeatured: false, sortOrder: 1 },
    ])

    // Variant 1: same mapping, no images (images only on index 0)
    expect(input.variants[1].sku).toBe('M-002')
    expect(input.variants[1].stockQuantity).toBe(3)
    expect(input.variants[1].prices).toEqual([
      { priceType: 'RETAIL_PRICE', price: '79.99' },
    ])
    expect(input.variants[1].images).toBeUndefined()
  })

  it('does not attach images to variant index 0 when payload.images is empty', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      addProductInformation: {
        product: { id: 'new-2', name: 'No Img', slug: 'no-img', status: 'PENDING' },
        variants: [],
      },
    })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({
        name: 'No Img',
        slug: 'no-img',
        shortDescription: '',
        description: '',
        status: 'PENDING' as ProductPayload['status'],
        categoryId: 'cat-1',
        images: [],
        variants: [{ sku: 'NI-001', price: '9.99', stock: 1 }],
      })
    })

    await waitFor(() => {
      expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
    const input = (variables as { input: { variants: Array<{ images?: unknown }> } }).input
    expect(input.variants[0].images).toBeUndefined()
  })

  it('preserves variant id when present (update-style variant)', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      addProductInformation: {
        product: { id: 'new-3', name: 'With ID', slug: 'with-id', status: 'ACTIVE' },
        variants: [],
      },
    })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: createWrapper() })

    await act(async () => {
      result.current.mutate({
        name: 'With ID',
        slug: 'with-id',
        shortDescription: '',
        description: '',
        status: 'ACTIVE' as ProductPayload['status'],
        categoryId: 'cat-1',
        images: [],
        variants: [{ id: 'existing-var-id', sku: 'EX-001', price: '15.00', stock: 2 }],
      })
    })

    await waitFor(() => {
      expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
    const input = (variables as { input: { variants: Array<{ id?: string }> } }).input
    expect(input.variants[0].id).toBe('existing-var-id')
  })
})
