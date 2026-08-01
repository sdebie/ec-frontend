/**
 * Tests that the wholesale application form preserves entered field values
 * after a rate-limit error (mutation onSuccess never fires).
 *
 * Validates: Requirements 8.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mockMutate = vi.fn()

vi.mock('../hooks/useWholesaleApplicationSubmit', () => ({
  useWholesaleApplicationSubmit: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}))

import { WholesaleApplicationPage } from '../WholesaleApplicationPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <WholesaleApplicationPage />
    </MemoryRouter>,
  )
}

describe('WholesaleApplicationPage — form state preserved after rate-limit error', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('preserves entered field values when mutation errors (onSuccess not called)', async () => {
    // mutate is called but onSuccess is never invoked — this is the rate-limit error path:
    // the hook's onError fires (showing the toast), but onSuccess is not called,
    // so the form stays in its current state with all values intact.
    mockMutate.mockImplementation(() => {})

    const user = userEvent.setup()
    renderPage()

    // Fill in form data across multiple sections
    await user.type(screen.getByLabelText(/^First Name/), 'Jane')
    await user.type(screen.getByLabelText(/^Last Name/), 'Smith')
    await user.type(screen.getByLabelText(/^Email/), 'jane@company.co.za')
    await user.type(screen.getByLabelText(/^Phone/), '0831234567')
    await user.type(screen.getByLabelText(/Company Name/), 'Smith Industries')
    await user.type(screen.getByLabelText('Address Line 1*'), '456 Oak Ave')
    await user.type(screen.getByLabelText('City*'), 'Cape Town')
    await user.type(screen.getByLabelText('Province*'), 'Western Cape')
    await user.type(screen.getByLabelText('Postal Code*'), '8001')

    // Submit — the mocked mutate does NOT call onSuccess (simulates rate-limit error path)
    await user.click(screen.getByRole('button', { name: 'Submit Application' }))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled()
    })

    // Form should NOT show success state
    expect(screen.queryByText('Application submitted')).not.toBeInTheDocument()

    // All field values should be preserved
    expect(screen.getByLabelText(/^First Name/)).toHaveValue('Jane')
    expect(screen.getByLabelText(/^Last Name/)).toHaveValue('Smith')
    expect(screen.getByLabelText(/^Email/)).toHaveValue('jane@company.co.za')
    expect(screen.getByLabelText(/^Phone/)).toHaveValue('0831234567')
    expect(screen.getByLabelText(/Company Name/)).toHaveValue('Smith Industries')
    expect(screen.getByLabelText('Address Line 1*')).toHaveValue('456 Oak Ave')
    expect(screen.getByLabelText('City*')).toHaveValue('Cape Town')
    expect(screen.getByLabelText('Province*')).toHaveValue('Western Cape')
    expect(screen.getByLabelText('Postal Code*')).toHaveValue('8001')

    // Form should still be interactive — user can retry
    expect(screen.getByRole('button', { name: 'Submit Application' })).toBeEnabled()
  })
})
