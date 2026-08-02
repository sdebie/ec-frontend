import {Heart, LayoutDashboard, Package, UserRound} from 'lucide-react'
import {Outlet} from 'react-router-dom'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {
    type StorefrontSideNavigationItem,
    StorefrontSideNavigationLayout,
} from '@/storefront/layouts/StorefrontSideNavigationLayout'

const NAV_ITEMS: StorefrontSideNavigationItem[] = [
    {to: '/account/dashboard', label: 'Dashboard', icon: LayoutDashboard},
    {to: '/account/profile', label: 'Profile', icon: UserRound},
    {to: '/account/orders', label: 'Orders', icon: Package},
    {to: '/account/wishlist', label: 'Wishlist', icon: Heart},
]

export function AccountLayout() {
    const isSignedIn = useCustomerAuthStore((state) => state.isSignedIn)

    return (
        <StorefrontSideNavigationLayout
            items={NAV_ITEMS}
            navigationLabel="Account navigation"
            mobileMenuLabel="Account menu"
            showNavigation={isSignedIn}
        >
            <Outlet/>
        </StorefrontSideNavigationLayout>
    )
}
