import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/shared/utils/cn'

const NAV_ITEMS = [
  { to: '/account/dashboard', label: 'Dashboard' },
  { to: '/account/orders', label: 'Orders' },
  { to: '/account/profile', label: 'Profile' },
  { to: '/account/wishlist', label: 'Wishlist' },
]

export function AccountLayout() {
  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto px-4 py-8">
      {/* Desktop: sidebar navigation */}
      <nav aria-label="Account navigation" className="w-48 shrink-0 hidden md:block">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'font-semibold bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: horizontal tab strip */}
      <nav aria-label="Account navigation" className="md:hidden flex gap-4 overflow-x-auto pb-2 border-b border-gray-200">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'font-semibold bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Page content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
