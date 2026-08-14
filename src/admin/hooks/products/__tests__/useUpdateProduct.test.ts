/**
 * Feature: admin-product-write, Task 6.1
 * Hook-level test — exercises the REAL mapping in useUpdateProduct.
 * Mocks only adminGraphqlClient.request so the toProductInformationInput mapping
 * and onError behaviour actually execute.
 *
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
import { toast } from '@/shared/ui/components/toast'
import { useUpdateProduct } from '../useUpdateProduct'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUpdateProduct — real mapping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends updateProductInformation mutation with productId in variables', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      updateProductInformation: {
        product: { id: 'prod-42', name: 'Updated', slug: 'updated', status: 'ACTIVE' },
        variants: [],
      },
    })

    const { result } = renderHook(() => useUpdateProduct('prod-42'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        name: 'Updated',
        slug: 'updated',
        shortDescription: '',
        description: '',
        status: 'ACTIVE' as 'ACTIVE',
        categoryIds: ['cat-1'],
        images: [],
        variants: [{ id: 'var-1', sku: 'UPD-001', price: '25.00', stock: 7, attributes: [] }],
      })
    })

    await waitFor(() => {
      expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    })

    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    // Verify mutation document
    expect(String(document)).toContain('updateProductInformation')
    expect(String(document)).toContain('mutation')

    expect((variables as { productId: string }).productId).toBe('prod-42')
  })

  it('maps form payload identically to useCreateProduct (price→RETAIL_PRICE, stock→stockQuantity, images on variant[0])', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      updateProductInformation: {
        product: { id: 'prod-42', name: 'Mapped', slug: 'mapped', status: 'ACTIVE' },
        variants: [],
      },
    })

    const { result } = renderHook(() => useUpdateProduct('prod-42'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        name: 'Mapped Edit',
        slug: 'mapped-edit',
        shortDescription: 'short',
        description: 'long',
        status: 'ACTIVE' as 'ACTIVE',
        categoryIds: ['cat-5'],
        images: [{ url: 'img-a.jpg', altText: 'Front view' }, { url: 'img-b.jpg' }],
        variants: [
          { id: 'v1', sku: 'ME-001', price: '100.50', stock: 20, attributes: [{ key: 'Size', value: 'M' }] },
          { sku: 'ME-002', price: '50.00', stock: 0, attributes: [] },
        ],
      })
    })

    await waitFor(() => {
      expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
    const input = (variables as { input: {
      product: { name: string; slug: string; categories: Array<{ id: string }> }
      variants: Array<{
        id?: string
        sku: string
        stockQuantity: number
        attributesJson: string
        prices: Array<{ priceType: string; price: string }>
        images?: Array<{ imageUrl: string; featured: boolean; sortOrder: number }>
      }>
    } }).input

    // Product mapping
    expect(input.product.name).toBe('Mapped Edit')
    expect(input.product.slug).toBe('mapped-edit')
    expect(input.product.categories).toEqual([{ id: 'cat-5' }])

    // Variant 0 with existing id
    expect(input.variants[0].id).toBe('v1')
    expect(input.variants[0].stockQuantity).toBe(20)
    expect(input.variants[0].attributesJson).toBe('{"Size":"M"}')
    expect(input.variants[0].prices).toEqual([{ priceType: 'RETAIL_PRICE', price: '100.50' }])
    expect(input.variants[0].images).toEqual([
      { imageUrl: 'img-a.jpg', featured: true, sortOrder: 0, altText: 'Front view' },
      // Absent alt text is sent as null, matching images that never had one
      { imageUrl: 'img-b.jpg', featured: false, sortOrder: 1, altText: null },
    ])

    // Variant 1 (new, no id), no attributes still serialises to '{}'
    expect(input.variants[1].id).toBeUndefined()
    expect(input.variants[1].sku).toBe('ME-002')
    expect(input.variants[1].stockQuantity).toBe(0)
    expect(input.variants[1].attributesJson).toBe('{}')
    expect(input.variants[1].images).toBeUndefined()
  })

  it('calls console.error and toast.error on mutation failure (onError handler)', async () => {
    const networkError = new Error('GraphQL request failed')
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(networkError)
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useUpdateProduct('prod-fail'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        name: 'Fail',
        slug: 'fail',
        shortDescription: '',
        description: '',
        status: 'ACTIVE' as 'ACTIVE',
        categoryIds: ['cat-1'],
        images: [],
        variants: [{ sku: 'F-001', price: '10.00', stock: 1, attributes: [] }],
      })
    })

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ProductWrite] action failed:',
        networkError,
      )
    })

    expect(toast.error).toHaveBeenCalledWith('Failed to save product', { duration: 0 })

    consoleErrorSpy.mockRestore()
  })

  it('invalidates the product list and stats caches on success', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      updateProductInformation: {
        product: { id: 'prod-42', name: 'Updated', slug: 'updated', status: 'ACTIVE' },
        variants: [],
      },
    })

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useUpdateProduct('prod-42'), { wrapper })

    await act(async () => {
      result.current.mutate({
        name: 'Updated',
        slug: 'updated',
        shortDescription: '',
        description: '',
        status: 'ACTIVE' as 'ACTIVE',
        categoryIds: ['cat-1'],
        images: [],
        variants: [{ id: 'var-1', sku: 'UPD-001', price: '25.00', stock: 7, attributes: [] }],
      })
    })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-products-list'] })
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-product-stats'] })
  })
})
