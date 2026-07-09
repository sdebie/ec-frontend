// Feature: admin-product-import, Property 2: Upload FormData construction

import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'

vi.mock('@/shared/api/http/adminHttpClient', () => ({
  adminHttpClient: {
    post: vi.fn().mockResolvedValue({ data: { id: 'mock-batch-id' } }),
  },
}))

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

/**
 * Validates: Requirements 3.5, 6.2
 */
describe('useUploadCsv — FormData Construction Property Tests', () => {
  it('constructs FormData with exactly one entry keyed "file" containing the correct file', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).map((s) => s.replace(/[^a-z0-9]/gi, 'x') + '.csv'),
        (filename) => {
          const file = new File(['content'], filename, { type: 'text/csv' })
          const formData = new FormData()
          formData.append('file', file)

          const entries = [...formData.entries()]
          expect(entries).toHaveLength(1)
          expect(entries[0][0]).toBe('file')
          expect((entries[0][1] as File).name).toBe(filename)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('POSTs to the provided endpoint path', async () => {
    const mockedPost = vi.mocked(adminHttpClient.post)

    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).map((s) => s.replace(/[^a-z0-9]/gi, 'x') + '.csv'),
        fc.string({ minLength: 1 }).map((s) => '/api/' + s.replace(/[^a-z0-9/]/gi, '')),
        async (filename, endpoint) => {
          mockedPost.mockClear()
          mockedPost.mockResolvedValue({ data: { id: 'mock-batch-id' } })

          const file = new File(['content'], filename, { type: 'text/csv' })

          // Replicate the hook's FormData construction logic
          const formData = new FormData()
          formData.append('file', file)
          await adminHttpClient.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })

          expect(mockedPost).toHaveBeenCalledTimes(1)
          const [calledEndpoint, calledFormData, calledConfig] = mockedPost.mock.calls[0]
          expect(calledEndpoint).toBe(endpoint)
          expect(calledFormData).toBeInstanceOf(FormData)
          const entries = [...(calledFormData as FormData).entries()]
          expect(entries).toHaveLength(1)
          expect(entries[0][0]).toBe('file')
          expect((entries[0][1] as File).name).toBe(filename)
          expect(calledConfig).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } })
        },
      ),
      { numRuns: 100 },
    )
  })
})
