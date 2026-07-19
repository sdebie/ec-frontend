import { createElement } from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/http/adminHttpClient', () => ({
  adminHttpClient: {
    post: vi.fn(),
  },
}))

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import { useUploadCsv } from '../useUploadCsv'

const mockPost = adminHttpClient.post as ReturnType<typeof vi.fn>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUploadCsv', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts one buffered CSV file with no timeout and lets the browser set the multipart boundary', async () => {
    mockPost.mockResolvedValueOnce({ data: { batchId: 'batch-1' } })
    const file = new File(['sku,name\nSKU-1,Product'], 'products.csv', { type: 'text/csv' })
    const { result } = renderHook(() => useUploadCsv(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ file, endpoint: '/admin/products/upload-csv' })
    })

    expect(mockPost).toHaveBeenCalledTimes(1)
    const [endpoint, body, config] = mockPost.mock.calls[0]
    expect(endpoint).toBe('/admin/products/upload-csv')
    expect(body).toBeInstanceOf(FormData)
    // The hook uploads an in-memory copy, decoupled from the file's on-disk
    // state (Safari/iCloud eviction fix) — same name/type/content, new File.
    const sent = (body as FormData).get('file') as File
    expect(sent).toBeInstanceOf(File)
    expect(sent).not.toBe(file)
    expect(sent.name).toBe('products.csv')
    expect(sent.type).toBe('text/csv')
    expect(new TextDecoder().decode(await sent.arrayBuffer())).toBe('sku,name\nSKU-1,Product')
    expect(config).toEqual({ timeout: 0 })
  })

  it('logs upload failures for diagnosis', async () => {
    const error = new Error('Network Error')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mockPost.mockRejectedValueOnce(error)
    const { result } = renderHook(() => useUploadCsv(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync({
      file: new File([''], 'products.csv', { type: 'text/csv' }),
      endpoint: '/admin/products/upload-csv',
    })).rejects.toThrow(error)

    expect(consoleError).toHaveBeenCalledWith('[ProductImport] CSV upload failed:', error)
    consoleError.mockRestore()
  })
})
