import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/shared/api/http/adminHttpClient', () => ({
  adminHttpClient: {
    delete: vi.fn(),
  },
}))

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import { useDeleteImage } from '../useDeleteImage'

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useDeleteImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves when the backend reports the image was deleted', async () => {
    vi.mocked(adminHttpClient.delete).mockResolvedValue({ data: { deleted: true } })

    const { result } = renderHook(() => useDeleteImage(), { wrapper })
    result.current.mutate('orphan.jpg')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(adminHttpClient.delete).toHaveBeenCalledWith('/admin/images/cleanup', {
      data: { filePath: 'orphan.jpg' },
    })
  })

  // This is the case that matters: a 200 response with deleted:false is not an HTTP
  // error, so nothing rejects it automatically — the hook itself must turn "declined"
  // into a mutation error, using the backend's reason as the message, so the UI can
  // show the caller why the delete was refused instead of silently succeeding.
  it('rejects with the backend reason when the image is still in use', async () => {
    vi.mocked(adminHttpClient.delete).mockResolvedValue({
      data: { deleted: false, reason: 'Image is still in use (1 brand)' },
    })

    const { result } = renderHook(() => useDeleteImage(), { wrapper })
    result.current.mutate('brand-logo.jpg')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toBe('Image is still in use (1 brand)')
  })

  it('falls back to a generic message when the backend omits a reason', async () => {
    vi.mocked(adminHttpClient.delete).mockResolvedValue({ data: { deleted: false } })

    const { result } = renderHook(() => useDeleteImage(), { wrapper })
    result.current.mutate('mystery.jpg')

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect((result.current.error as Error).message).toBe('Image is still in use')
  })
})
