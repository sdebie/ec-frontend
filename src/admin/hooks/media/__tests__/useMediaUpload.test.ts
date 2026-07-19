import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/shared/api/http/adminHttpClient', () => ({
  adminHttpClient: {
    post: vi.fn(),
  },
}))

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import { useMediaUpload } from '../useMediaUpload'

const mockPost = adminHttpClient.post as ReturnType<typeof vi.fn>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useMediaUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns upload function and isUploading flag', () => {
    const { result } = renderHook(() => useMediaUpload(), { wrapper: createWrapper() })
    expect(typeof result.current.upload).toBe('function')
    expect(result.current.isUploading).toBe(false)
  })

  it('POSTs FormData to /admin/images/upload without a hardcoded Content-Type and returns the fileName', async () => {
    mockPost.mockResolvedValueOnce({ data: { fileName: 'abc123-uuid.jpg' } })

    const { result } = renderHook(() => useMediaUpload(), { wrapper: createWrapper() })
    const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' })

    let returnedFileName: string | undefined
    await act(async () => {
      returnedFileName = await result.current.upload(file)
    })

    expect(returnedFileName).toBe('abc123-uuid.jpg')
    expect(mockPost).toHaveBeenCalledTimes(1)

    const [url, body, config] = mockPost.mock.calls[0]
    expect(url).toBe('/admin/images/upload')
    expect(body).toBeInstanceOf(FormData)
    // No config/headers: the browser must set multipart/form-data with the
    // boundary itself — a hardcoded Content-Type breaks uploads in Safari.
    expect(config).toBeUndefined()
  })

  it('appends the file under the "file" field', async () => {
    mockPost.mockResolvedValueOnce({ data: { fileName: 'img-uuid.png' } })

    const { result } = renderHook(() => useMediaUpload(), { wrapper: createWrapper() })
    const file = new File(['px'], 'img.png', { type: 'image/png' })

    await act(async () => { await result.current.upload(file) })

    const formData: FormData = mockPost.mock.calls[0][1]
    expect(formData.get('file')).toBe(file)
  })

  it('sets isUploading to true while the request is in flight', async () => {
    let resolvePost: (v: unknown) => void
    mockPost.mockImplementationOnce(() => new Promise((r) => { resolvePost = r }))

    const { result } = renderHook(() => useMediaUpload(), { wrapper: createWrapper() })
    const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' })

    act(() => { result.current.upload(file) })
    await waitFor(() => expect(result.current.isUploading).toBe(true))

    await act(async () => { resolvePost!({ data: { fileName: 'test-uuid.jpg' } }) })
    await waitFor(() => expect(result.current.isUploading).toBe(false))
  })

  it('propagates errors from the HTTP client', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useMediaUpload(), { wrapper: createWrapper() })
    const file = new File(['data'], 'fail.jpg', { type: 'image/jpeg' })

    await expect(act(async () => { await result.current.upload(file) })).rejects.toThrow('Network error')
  })
})
