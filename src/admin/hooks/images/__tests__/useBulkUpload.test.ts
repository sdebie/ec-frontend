import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

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

describe('useBulkUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('batches correctly at 100 files boundary', async () => {
    const files = Array.from({ length: 250 }, (_, i) =>
      new File([''], `img${i}.jpg`, { type: 'image/jpeg' })
    )

    mockPost
      .mockResolvedValueOnce({ data: { uploaded: 100, skipped: 0 } })
      .mockResolvedValueOnce({ data: { uploaded: 100, skipped: 0 } })
      .mockResolvedValueOnce({ data: { uploaded: 50, skipped: 0 } })

    const { result } = renderHook(() => useBulkUpload())

    await act(async () => {
      await result.current.upload(files, 'products')
    })

    expect(mockPost).toHaveBeenCalledTimes(3)

    const firstBatchFormData: FormData = mockPost.mock.calls[0][1]
    expect(firstBatchFormData.getAll('images')).toHaveLength(100)

    const secondBatchFormData: FormData = mockPost.mock.calls[1][1]
    expect(secondBatchFormData.getAll('images')).toHaveLength(100)

    const thirdBatchFormData: FormData = mockPost.mock.calls[2][1]
    expect(thirdBatchFormData.getAll('images')).toHaveLength(50)
  })

  it('stops and toasts on first batch error', async () => {
    const files = Array.from({ length: 250 }, (_, i) =>
      new File([''], `img${i}.jpg`, { type: 'image/jpeg' })
    )

    mockPost
      .mockResolvedValueOnce({ data: { uploaded: 100, skipped: 0 } })
      .mockRejectedValueOnce(new Error('Server error'))

    const { result } = renderHook(() => useBulkUpload())

    await act(async () => {
      await result.current.upload(files, '')
    })

    expect(mockPost).toHaveBeenCalledTimes(2)
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining('batch 2 of 3'),
      { duration: 0 }
    )
  })

  it('returns correct { uploaded, skipped } totals', async () => {
    const files = Array.from({ length: 150 }, (_, i) =>
      new File([''], `img${i}.jpg`, { type: 'image/jpeg' })
    )

    mockPost
      .mockResolvedValueOnce({ data: { uploaded: 95, skipped: 5 } })
      .mockResolvedValueOnce({ data: { uploaded: 48, skipped: 2 } })

    const { result } = renderHook(() => useBulkUpload())

    let uploadResult: { uploaded: number; skipped: number } | undefined
    await act(async () => {
      uploadResult = await result.current.upload(files, 'products')
    })

    expect(uploadResult).toEqual({ uploaded: 143, skipped: 7 })
  })
})
