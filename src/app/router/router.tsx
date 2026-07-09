import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { StorefrontLayout } from '@/storefront/layouts/StorefrontLayout'
import { AdminLayout } from '@/admin/layouts/AdminLayout'
import { AdminGuard } from './AdminGuard'
import { CustomerGuard } from './CustomerGuard'
import { buildAdminRouteObjects } from './buildAdminRoutes'
import { adminRoutingRoutes } from '@/admin/routes/adminPageRoutes.config'
import { HomePage } from '@/storefront/pages/HomePage'
import { AccountLoginPage } from '@/storefront/pages/AccountLoginPage'
import { AccountRegisterPage } from '@/storefront/pages/AccountRegisterPage'
import { AccountDashboardPage } from '@/storefront/customer/account/AccountDashboardPage'
import { NotFoundPage } from '@/storefront/pages/NotFoundPage'
import { AdminLoginPage } from '@/admin/pages/AdminLoginPage'
import { AdminNotFoundPage } from '@/admin/pages/AdminNotFoundPage'
import { AccountLayout } from '@/storefront/customer/account/AccountLayout'
import { OrderHistoryPage } from '@/storefront/customer/account/orders/OrderHistoryPage'
import { OrderDetailPage } from '@/storefront/customer/account/orders/OrderDetailPage'
import { ProfilePage } from '@/storefront/customer/account/profile/ProfilePage'
import { WishlistPage } from '@/storefront/customer/account/wishlist/WishlistPage'
import { WholesaleApplicationPage } from '@/storefront/wholesale/WholesaleApplicationPage'

// eslint-disable-next-line react-refresh/only-export-components
const ForgotPasswordPage = lazy(() =>
  import('@/storefront/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
// eslint-disable-next-line react-refresh/only-export-components
const ProductListPage = lazy(() =>
  import('@/storefront/catalog/ProductListPage').then((m) => ({ default: m.ProductListPage })),
)
// eslint-disable-next-line react-refresh/only-export-components
const ProductDetailPage = lazy(() =>
  import('@/storefront/catalog/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
)
// eslint-disable-next-line react-refresh/only-export-components
const CartPage = lazy(() =>
  import('@/storefront/cart/CartPage').then((m) => ({ default: m.CartPage })),
)
// eslint-disable-next-line react-refresh/only-export-components
const CheckoutPage = lazy(() =>
  import('@/storefront/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
)
// eslint-disable-next-line react-refresh/only-export-components
const CheckoutSuccessPage = lazy(() =>
  import('@/storefront/checkout/CheckoutSuccessPage').then((m) => ({ default: m.CheckoutSuccessPage })),
)

export const router = createBrowserRouter([
  {
    element: <StorefrontLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <Suspense fallback={null}><ProductListPage /></Suspense> },
      { path: '/products/:slug', element: <Suspense fallback={null}><ProductDetailPage /></Suspense> },
      { path: '/account/login', element: <AccountLoginPage /> },
      { path: '/account/register', element: <AccountRegisterPage /> },
      { path: '/account/forgot-password', element: <Suspense fallback={null}><ForgotPasswordPage /></Suspense> },
      {
        path: '/account',
        element: (
          <CustomerGuard>
            <AccountLayout />
          </CustomerGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/account/dashboard" replace /> },
          { path: 'dashboard', element: <AccountDashboardPage /> },
          { path: 'orders', element: <OrderHistoryPage /> },
          { path: 'orders/:orderId', element: <OrderDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'wishlist', element: <WishlistPage /> },
        ],
      },
      { path: '/cart', element: <Suspense fallback={null}><CartPage /></Suspense> },
      { path: '/checkout', element: <Suspense fallback={null}><CheckoutPage /></Suspense> },
      { path: '/checkout/success', element: <Suspense fallback={null}><CheckoutSuccessPage /></Suspense> },
      { path: '/wholesale-application', element: <WholesaleApplicationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      ...buildAdminRouteObjects(adminRoutingRoutes),
      { path: '*', element: <AdminNotFoundPage /> },
    ],
  },
])
