import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { StorefrontSideNavigationLayout } from './StorefrontSideNavigationLayout'

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
]

function renderLayout(showNavigation = true) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <StorefrontSideNavigationLayout
        items={items}
        navigationLabel="Account navigation"
        mobileMenuLabel="Account menu"
        showNavigation={showNavigation}
      >
        <h1>Page content</h1>
      </StorefrontSideNavigationLayout>
    </MemoryRouter>,
  )
}

describe('StorefrontSideNavigationLayout', () => {
  it('renders supplied navigation items beside the supplied page content', () => {
    renderLayout()

    expect(screen.getByRole('navigation', { name: 'Account navigation' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('heading', { name: 'Page content' })).toBeInTheDocument()
  })

  it('opens a mobile drawer containing the same supplied navigation items', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Account menu' }))

    const drawer = screen.getByRole('dialog', { name: 'Account navigation' })
    expect(within(drawer).getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile')

    await user.click(within(drawer).getByRole('link', { name: 'Profile' }))
    expect(screen.queryByRole('dialog', { name: 'Account navigation' })).not.toBeInTheDocument()
  })

  it('renders only its children when navigation is intentionally unavailable', () => {
    renderLayout(false)

    expect(screen.getByRole('heading', { name: 'Page content' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Account navigation' })).not.toBeInTheDocument()
  })
})
