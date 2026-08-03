import {type ComponentType, lazy, Suspense} from 'react'
import {createBrowserRouter, Navigate} from 'react-router-dom'
import {StorefrontLayout} from '@/storefront/layouts/StorefrontLayout'
import {StorefrontConfigProvider} from '@/app/providers/StorefrontConfigProvider'
import {AdminLayout} from '@/admin/layouts/AdminLayout'
import {AdminGuard} from './AdminGuard'
import {CustomerGuard} from './CustomerGuard'
import {buildAdminRouteObjects} from './buildAdminRoutes'
import {adminRoutingRoutes} from '@/admin/routes/adminPageRoutes.config'
import {AccountLayout} from '@/storefront/customer/account/AccountLayout'

const lazyPage = <T extends Record<string, unknown>>(loader: () => Promise<T>, exportName: keyof T) =>
    lazy(async () => ({default: (await loader())[exportName] as ComponentType}))

const HomePage = lazyPage(() => import('@/storefront/pages/HomePage'), 'HomePage')
const AccountLoginPage = lazyPage(() => import('@/storefront/pages/AccountLoginPage'), 'AccountLoginPage')
const AccountRegisterPage = lazyPage(() => import('@/storefront/pages/AccountRegisterPage'), 'AccountRegisterPage')
const AccountDashboardPage = lazyPage(() => import('@/storefront/customer/account/AccountDashboardPage'), 'AccountDashboardPage')
const NotFoundPage = lazyPage(() => import('@/storefront/pages/NotFoundPage'), 'NotFoundPage')
const AdminLoginPage = lazyPage(() => import('@/admin/pages/AdminLoginPage'), 'AdminLoginPage')
const AdminNotFoundPage = lazyPage(() => import('@/admin/pages/AdminNotFoundPage'), 'AdminNotFoundPage')
const AdminResetPasswordPage = lazyPage(() => import('@/admin/pages/AdminResetPasswordPage'), 'AdminResetPasswordPage')
const OrderHistoryPage = lazyPage(() => import('@/storefront/customer/account/orders/OrderHistoryPage'), 'OrderHistoryPage')
const OrderDetailPage = lazyPage(() => import('@/storefront/customer/account/orders/OrderDetailPage'), 'OrderDetailPage')
const ProfilePage = lazyPage(() => import('@/storefront/customer/account/profile/ProfilePage'), 'ProfilePage')
const WishlistPage = lazyPage(() => import('@/storefront/customer/account/wishlist/WishlistPage'), 'WishlistPage')
const WholesaleApplicationPage = lazyPage(() => import('@/storefront/wholesale/WholesaleApplicationPage'), 'WholesaleApplicationPage')

// eslint-disable-next-line react-refresh/only-export-components
const ForgotPasswordPage = lazy(() =>
    import('@/storefront/pages/ForgotPasswordPage').then((m) => ({default: m.ForgotPasswordPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const ProductListPage = lazy(() =>
    import('@/storefront/catalog/ProductListPage').then((m) => ({default: m.ProductListPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const ProductDetailPage = lazy(() =>
    import('@/storefront/catalog/ProductDetailPage').then((m) => ({default: m.ProductDetailPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const CartPage = lazy(() =>
    import('@/storefront/cart/CartPage').then((m) => ({default: m.CartPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const CheckoutPage = lazy(() =>
    import('@/storefront/checkout/CheckoutPage').then((m) => ({default: m.CheckoutPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const CheckoutSuccessPage = lazy(() =>
    import('@/storefront/checkout/CheckoutSuccessPage').then((m) => ({default: m.CheckoutSuccessPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const PageContentPage = lazy(() =>
    import('@/storefront/page-content/PageContentPage').then((m) => ({default: m.PageContentPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const ContactUsPage = lazy(() =>
    import('@/storefront/pages/ContactUsPage').then((m) => ({default: m.ContactUsPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const AboutPage = lazy(() =>
    import('@/storefront/pages/AboutPage').then((m) => ({default: m.AboutPage})),
)
// eslint-disable-next-line react-refresh/only-export-components
const QuoteRequestPage = lazy(() =>
    import('@/storefront/quote/QuoteRequestPage').then((m) => ({default: m.QuoteRequestPage})),
)

export const router = createBrowserRouter([
    {
        // StorefrontConfigProvider is scoped to the storefront branch only —
        // the admin panel must never depend on /storefront/config being available.
        element: (
            <StorefrontConfigProvider>
                <StorefrontLayout/>
            </StorefrontConfigProvider>
        ),
        children: [
            {
                path: '/',
                element: (
                    <Suspense fallback={null}>
                        <HomePage/>
                    </Suspense>
                )
            },
            {
                path: '/products',
                element: <Suspense fallback={null}><ProductListPage/></Suspense>
            },
            {
                path: '/specials',
                element: <Suspense fallback={null}><ProductListPage onSale/></Suspense>
            },
            {
                path: '/products/:slug',
                element: <Suspense fallback={null}><ProductDetailPage/></Suspense>
            },
            {
                path: '/account/login',
                element: <Suspense fallback={null}><AccountLoginPage/></Suspense>
            },
            {
                path: '/account/register',
                element: <Suspense fallback={null}><AccountRegisterPage/></Suspense>
            },
            {
                path: '/account/forgot-password',
                element: (
                    <Suspense fallback={null}>
                        <ForgotPasswordPage/>
                    </Suspense>
                )
            },
            {
                path: '/account',
                element: <AccountLayout/>,
                children: [
                    {index: true, element: <CustomerGuard><Navigate to="/account/dashboard" replace/></CustomerGuard>},
                    {path: 'dashboard', element: <CustomerGuard><Suspense fallback={null}><AccountDashboardPage/></Suspense></CustomerGuard>},
                    {path: 'orders', element: <CustomerGuard><Suspense fallback={null}><OrderHistoryPage/></Suspense></CustomerGuard>},
                    {path: 'orders/:orderId', element: <CustomerGuard><Suspense fallback={null}><OrderDetailPage/></Suspense></CustomerGuard>},
                    {path: 'profile', element: <CustomerGuard><Suspense fallback={null}><ProfilePage/></Suspense></CustomerGuard>},
                    {path: 'wishlist', element: <Suspense fallback={null}><WishlistPage/></Suspense>},
                ],
            },
            {
                path: '/cart', element: (
                    <Suspense fallback={null}>
                        <CartPage/>
                    </Suspense>
                )
            },
            {
                path: '/checkout', element: <Suspense fallback={null}><CheckoutPage/></Suspense>
            },
            {
                path: '/checkout/success', element: <Suspense fallback={null}><CheckoutSuccessPage/></Suspense>
            },
            {
                path: '/wholesale-application',
                element: <Suspense fallback={null}><WholesaleApplicationPage/></Suspense>
            },
            {
                path: '/contact-us', element: <Suspense fallback={null}><ContactUsPage/></Suspense>
            },
            {
                path: '/quote-request', element: <Suspense fallback={null}><QuoteRequestPage/></Suspense>
            },
            {
                path: '/about-us', element: <Suspense fallback={null}><AboutPage/></Suspense>
            },
            {
                path: '/terms-and-conditions',
                element: <Suspense fallback={null}><PageContentPage slug="terms-and-conditions"/></Suspense>
            },
            {
                path: '/privacy-policy',
                element: <Suspense fallback={null}><PageContentPage slug="privacy-policy"/></Suspense>
            },
            {
                path: '/delivery-and-returns',
                element: <Suspense fallback={null}><PageContentPage slug="delivery-and-returns"/></Suspense>
            },
            {
                path: '*', element: <Suspense fallback={null}><NotFoundPage/></Suspense>
            },
        ],
    },
    {
        path: '/admin/login',
        element: (
            <Suspense fallback={null}>
                <AdminLoginPage/>
            </Suspense>
        ),
    },
    {
        // Deliberately OUTSIDE AdminGuard. The guard redirects here when an account
        // must change its password, so a guarded route would redirect into itself
        // forever. It is also a standalone full-screen card, not admin chrome, so it
        // does not belong inside AdminLayout either. Access is still authenticated —
        // the reset request carries the token the login flow now retains.
        path: '/admin/reset-password',
        element: (
            <Suspense fallback={null}>
                <AdminResetPasswordPage/>
            </Suspense>
        ),
    },
    {
        path: '/admin',
        element: (
            <AdminGuard>
                <AdminLayout/>
            </AdminGuard>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/admin/dashboard" replace/>
            },
            ...buildAdminRouteObjects(adminRoutingRoutes),
            {
                path: '*', element: (
                    <Suspense fallback={null}>
                        <AdminNotFoundPage/>
                    </Suspense>
                )
            },
        ],
    },
])
