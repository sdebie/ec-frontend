import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

/**
 * Property 5: DataTable pagination reset on filter change
 *
 * For any status filter change, the DataTable pageIndex SHALL reset to 0
 * before the refetch is triggered, regardless of the previous pageIndex.
 *
 * **Validates: Requirements 3.3, 7.2**
 */

const mockUseAdminProductList = vi.fn(() => ({
  data: { content: [], totalElements: 0, totalPages: 0 },
  isLoading: false,
  refetch: vi.fn(),
}))

vi.mock('@/admin/hooks/products/useAdminProductList', () => ({
  useAdminProductList: (...args: unknown[]) => mockUseAdminProductList(...args),
}))

vi.mock('@/admin/hooks/products/useDeleteProductGql', () => ({
  useDeleteProductGql: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

vi.mock('@/admin/hooks/products/useUpdateProductStatusGql', () => ({
  useUpdateProductStatusGql: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

vi.mock('@/admin/hooks/products/useProductStats', () => ({
  useProductStats: vi.fn(() => ({
    data: { total: 10, active: 5, pending: 3, disabled: 2 },
    isLoading: false,
    isError: false,
  })),
}))

vi.mock('@/admin/hooks/products/useCategories', () => ({
  useCategories: vi.fn(() => ({ data: [], isLoading: false })),
}))

vi.mock('@/admin/hooks/products/useBrands', () => ({
  useBrands: vi.fn(() => ({ data: [], isLoading: false })),
}))

vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({ role: 'SUPER_ADMIN', authority: ['SUPER_ADMIN'] }),
  ),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// Status filter option values on the <select> element
const STATUS_FILTER_VALUES = ['ALL', 'ACTIVE', 'PENDING', 'DISABLED'] as const

describe('DataTable pagination reset on filter change — Property Tests', () => {
  beforeEach(() => {
    mockUseAdminProductList.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('pageIndex resets to 0 after any sequence of status filter changes', async () => {
    const { ProductListPage } = await import('../ProductListPage')

    const filterSequenceArb = fc.array(
      fc.constantFrom(...STATUS_FILTER_VALUES),
      { minLength: 2, maxLength: 6 },
    )

    fc.assert(
      fc.property(filterSequenceArb, (filterSequence) => {
        mockUseAdminProductList.mockClear()

        const { unmount } = render(
          <MemoryRouter>
            <ProductListPage />
          </MemoryRouter>,
        )

        // The status filter is a <select>; change it through the sequence
        const statusSelect = screen.getByDisplayValue('All')
        for (const value of filterSequence) {
          fireEvent.change(statusSelect, { target: { value } })
        }

        // After each filter change, useAdminProductList should be called with pageIndex=0
        const lastCall = mockUseAdminProductList.mock.calls[mockUseAdminProductList.mock.calls.length - 1]
        const params = lastCall[0] as { pageIndex: number; pageSize: number; status: string }

        expect(params.pageIndex).toBe(0)

        unmount()
      }),
      { numRuns: 50 },
    )
  }, 15000)

  it('pageIndex resets to 0 regardless of the specific filter transition', async () => {
    const { ProductListPage } = await import('../ProductListPage')

    const filterPairArb = fc
      .tuple(
        fc.constantFrom(...STATUS_FILTER_VALUES),
        fc.constantFrom(...STATUS_FILTER_VALUES),
      )
      .filter(([a, b]) => a !== b)

    fc.assert(
      fc.property(filterPairArb, ([firstValue, secondValue]) => {
        mockUseAdminProductList.mockClear()

        const { unmount } = render(
          <MemoryRouter>
            <ProductListPage />
          </MemoryRouter>,
        )

        const statusSelect = screen.getByDisplayValue('All')

        fireEvent.change(statusSelect, { target: { value: firstValue } })
        mockUseAdminProductList.mockClear()
        fireEvent.change(statusSelect, { target: { value: secondValue } })

        const lastCall = mockUseAdminProductList.mock.calls[mockUseAdminProductList.mock.calls.length - 1]
        const params = lastCall[0] as { pageIndex: number; pageSize: number; status: string }

        expect(params.pageIndex).toBe(0)

        unmount()
      }),
      { numRuns: 50 },
    )
  })
})
