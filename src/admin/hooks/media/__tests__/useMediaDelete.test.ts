import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/shared/api/http/adminHttpClient', () => ({
  adminHttpClient: {
    delete: vi.fn(),
  },
}))

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import { useMediaDelete } from '../useMediaDelete'

const mockDelete = adminHttpClient.delete as ReturnType<typeof vi.fn>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useMediaDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns remove function and isDeleting flag', () => {
    const { result } = renderHook(() => useMediaDelete(), { wrapper: createWrapper() })
    expect(typeof result.current.remove).toBe('function')
    expect(result.current.isDeleting).toBe(false)
  })

  it('extracts the filename and DELETEs /admin/media/{id}', async () => {
    mockDelete.mockResolvedValueOnce({})

    const { result } = renderHook(() => useMediaDelete(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.remove('/static/images/abc123.jpg')
    })

    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockDelete).toHaveBeenCalledWith('/admin/media/abc123.jpg')
  })

  it('uses only the last segment of the URL as the id', async () => {
    mockDelete.mockResolvedValueOnce({})

    const { result } = renderHook(() => useMediaDelete(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.remove('https://cdn.example.com/static/images/deep/path/file-xyz.png')
    })

    expect(mockDelete).toHaveBeenCalledWith('/admin/media/file-xyz.png')
  })

  it('sets isDeleting to true while the request is in flight', async () => {
    let resolveDelete: (v: unknown) => void
    mockDelete.mockImplementationOnce(() => new Promise((r) => { resolveDelete = r }))

    const { result } = renderHook(() => useMediaDelete(), { wrapper: createWrapper() })

    act(() => { result.current.remove('/static/images/img.jpg') })
    await waitFor(() => expect(result.current.isDeleting).toBe(true))

    await act(async () => { resolveDelete!({}) })
    await waitFor(() => expect(result.current.isDeleting).toBe(false))
  })

  it('propagates errors from the HTTP client', async () => {
    mockDelete.mockRejectedValueOnce(new Error('Not found'))

    const { result } = renderHook(() => useMediaDelete(), { wrapper: createWrapper() })

    await expect(
      act(async () => { await result.current.remove('/static/images/gone.jpg') }),
    ).rejects.toThrow('Not found')
  })
})
