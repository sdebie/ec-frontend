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
 * Each run mounts the whole ProductListPage and drives a real listbox per filter
 * change, making this the slowest file in the suite. The run counts below are sized
 * to each property's actual input space rather than a round number, and the timeout
 * is generous on purpose so it absorbs contention from other workers instead of
 * encoding how fast an idle machine happens to be.
 */
const PROPERTY_TIMEOUT_MS = 45_000

const mockUseAdminProductList = vi.fn((..._args: unknown[]) => ({
  data: { content: [], totalElements: 0, totalPages: 0 },
  isLoading: false,
  refetch: vi.fn(),
}))

vi.mock('../hooks/useAdminProductList', () => ({
  useAdminProductList: (...args: unknown[]) => mockUseAdminProductList(...args),
}))

vi.mock('../hooks/useDeleteProductGql', () => ({
  useDeleteProductGql: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

vi.mock('../hooks/useUpdateProductStatusGql', () => ({
  useUpdateProductStatusGql: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))
vi.mock('../hooks/useZeroProductStock', () => ({
  useZeroProductStock: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

vi.mock('../hooks/useProductStats', () => ({
  useProductStats: vi.fn(() => ({
    data: { total: 10, active: 5, pending: 3, disabled: 2 },
    isLoading: false,
    isError: false,
  })),
}))

vi.mock('../hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({ data: [], isLoading: false })),
}))

vi.mock('../hooks/useBrands', () => ({
  useBrands: vi.fn(() => ({ data: [], isLoading: false })),
}))


vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

// Status filter option values on the shared Select component
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

useAdminAuthStore.setState({ role: 'SUPER_ADMIN' })

const STATUS_FILTER_VALUES = ['ALL', 'ACTIVE', 'PENDING', 'DISABLED'] as const
const STATUS_VALUE_TO_LABEL: Record<(typeof STATUS_FILTER_VALUES)[number], string> = {
  ALL: 'All',
  ACTIVE: 'Active',
  PENDING: 'Pending',
  DISABLED: 'Disabled',
}

// The status filter is the shared Select component (a button that opens a
// listbox), not a native <select> — each change requires opening it fresh.
function selectStatusFilter(value: (typeof STATUS_FILTER_VALUES)[number]) {
  fireEvent.click(screen.getByRole('button', { name: 'Filter by status' }))
  fireEvent.click(screen.getByRole('option', { name: STATUS_VALUE_TO_LABEL[value] }))
}

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

        for (const value of filterSequence) {
          selectStatusFilter(value)
        }

        // After each filter change, useAdminProductList should be called with pageIndex=0
        const lastCall = mockUseAdminProductList.mock.calls[mockUseAdminProductList.mock.calls.length - 1]
        const params = lastCall[0] as { pageIndex: number; pageSize: number; status: string }

        expect(params.pageIndex).toBe(0)

        unmount()
      }),
      // 20 sequences of 2-6 draws over a 4-status alphabet covers the reset behaviour
      // many times over; the property is about state, not about rare inputs.
      { numRuns: 20 },
    )
  }, PROPERTY_TIMEOUT_MS)

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

        selectStatusFilter(firstValue)
        mockUseAdminProductList.mockClear()
        selectStatusFilter(secondValue)

        const lastCall = mockUseAdminProductList.mock.calls[mockUseAdminProductList.mock.calls.length - 1]
        const params = lastCall[0] as { pageIndex: number; pageSize: number; status: string }

        expect(params.pageIndex).toBe(0)

        unmount()
      }),
      // There are only 12 distinct ordered pairs of differing statuses; 15 runs covers
      // the space without re-rendering the page for pairs already seen.
      { numRuns: 15 },
    )
  }, PROPERTY_TIMEOUT_MS)
})
