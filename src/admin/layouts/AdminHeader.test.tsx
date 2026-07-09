import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { AdminHeader } from './AdminHeader'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderHeader(props: { onMenuClick?: () => void } = {}) {
  const onMenuClick = props.onMenuClick ?? vi.fn()
  return render(
    <MemoryRouter>
      <AdminHeader onMenuClick={onMenuClick} />
    </MemoryRouter>
  )
}

describe('AdminHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAdminAuthStore.setState({
      isSignedIn: true,
      token: 'test-token',
      role: 'ADMIN',
      authority: ['SUPER_ADMIN'],
      userName: 'TestUser',
      email: 'test@example.com',
    })
  })

  it('displays the first letter of userName as avatar initial', () => {
    renderHeader()
    const avatarButton = screen.getByTitle('Staff Profile')
    expect(avatarButton).toHaveTextContent('T')
  })

  it('falls back to "A" when userName is null', () => {
    useAdminAuthStore.setState({ userName: null })
    renderHeader()
    const avatarButton = screen.getByTitle('Staff Profile')
    expect(avatarButton).toHaveTextContent('A')
  })

  it('calls clearSession on logout click', async () => {
    const user = userEvent.setup()
    const mockClearSession = vi.fn()
    useAdminAuthStore.setState({ clearSession: mockClearSession })

    renderHeader()

    await user.click(screen.getByTitle('Staff Profile'))
    await user.click(screen.getByText('Log Out'))

    expect(mockClearSession).toHaveBeenCalledTimes(1)
  })

  it('navigates to /admin/login after logout', async () => {
    const user = userEvent.setup()
    const mockClearSession = vi.fn()
    useAdminAuthStore.setState({ clearSession: mockClearSession })

    renderHeader()

    await user.click(screen.getByTitle('Staff Profile'))
    await user.click(screen.getByText('Log Out'))

    expect(mockNavigate).toHaveBeenCalledWith('/admin/login', { replace: true })
  })

  it('calls onMenuClick when burger button is clicked', async () => {
    const user = userEvent.setup()
    const onMenuClick = vi.fn()

    renderHeader({ onMenuClick })

    await user.click(screen.getByText('Open sidebar'))

    expect(onMenuClick).toHaveBeenCalledTimes(1)
  })
})
