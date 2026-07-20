import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/shared/api/http/adminHttpClient', () => ({
  adminHttpClient: {
    post: vi.fn(),
  },
}))
vi.mock('@/shared/ui/components/toast', () => ({
  toast: {
    error: vi.fn(),
  },
}))

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import { toast } from '@/shared/ui/components/toast'
import { useBulkUpload } from '../useBulkUpload'

const mockPost = adminHttpClient.post as ReturnType<typeof vi.fn>
const mockToastError = toast.error as ReturnType<typeof vi.fn>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useBulkUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('batches correctly at the 20-file boundary', async () => {
    const files = Array.from({ length: 50 }, (_, i) =>
      new File([''], `img${i}.jpg`, { type: 'image/jpeg' })
    )

    mockPost
      .mockResolvedValueOnce({ data: { uploaded: 20, skipped: 0 } })
      .mockResolvedValueOnce({ data: { uploaded: 20, skipped: 0 } })
      .mockResolvedValueOnce({ data: { uploaded: 10, skipped: 0 } })

    const { result } = renderHook(() => useBulkUpload(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.upload(files, 'products')
    })

    expect(mockPost).toHaveBeenCalledTimes(3)

    const firstBatchFormData: FormData = mockPost.mock.calls[0][1]
    expect(firstBatchFormData.getAll('images')).toHaveLength(20)

    const secondBatchFormData: FormData = mockPost.mock.calls[1][1]
    expect(secondBatchFormData.getAll('images')).toHaveLength(20)

    const thirdBatchFormData: FormData = mockPost.mock.calls[2][1]
    expect(thirdBatchFormData.getAll('images')).toHaveLength(10)
  })

  it('continues past a failed batch and toasts the failure', async () => {
    const files = Array.from({ length: 50 }, (_, i) =>
      new File([''], `img${i}.jpg`, { type: 'image/jpeg' })
    )

    mockPost
      .mockResolvedValueOnce({ data: { uploaded: 20, skipped: 0 } })
      .mockRejectedValueOnce(new Error('Server error'))
      .mockResolvedValueOnce({ data: { uploaded: 10, skipped: 0 } })

    const { result } = renderHook(() => useBulkUpload(), { wrapper: createWrapper() })

    let uploadResult: { uploaded: number; skipped: number } | undefined
    await act(async () => {
      uploadResult = await result.current.upload(files, '')
    })

    expect(mockPost).toHaveBeenCalledTimes(3)
    expect(mockToastError).toHaveBeenCalledWith(
      'Batch 2 of 3 failed — continuing',
      { duration: 5000 }
    )
    expect(uploadResult).toEqual({ uploaded: 30, skipped: 0 })
  })

  it('returns correct { uploaded, skipped } totals', async () => {
    const files = Array.from({ length: 40 }, (_, i) =>
      new File([''], `img${i}.jpg`, { type: 'image/jpeg' })
    )

    mockPost
      .mockResolvedValueOnce({ data: { uploaded: 18, skipped: 2 } })
      .mockResolvedValueOnce({ data: { uploaded: 19, skipped: 1 } })

    const { result } = renderHook(() => useBulkUpload(), { wrapper: createWrapper() })

    let uploadResult: { uploaded: number; skipped: number } | undefined
    await act(async () => {
      uploadResult = await result.current.upload(files, 'products')
    })

    expect(uploadResult).toEqual({ uploaded: 37, skipped: 3 })
  })
})
