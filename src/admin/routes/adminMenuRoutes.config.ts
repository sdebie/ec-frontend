import {lazy} from 'react'
import type {AdminRouteList} from '@/admin/types/routes'
import {rolesFor} from '@/shared/auth/adminPermissions'

export const adminMenuRoutes: AdminRouteList = [
    {
        key: 'admin.dashboard',
        path: '/admin/dashboard',
        component: lazy(() =>
            import('@/admin/pages/AdminDashboardPage').then((m) => ({default: m.AdminDashboardPage}))
        ),
        authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            label: 'Dashboard',
            section: 'MAIN',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'layout-dashboard',
            menuMatch: 'exact',
        },
    },
    {
        key: 'admin.brands-categories',
        path: '/admin/products/categories',
        authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'VIEWER'],
        meta: {
            label: 'Brands & Categories',
            section: 'PRODUCT MANAGEMENT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'layout-grid',
        },
        subMenu: [
            {
                key: 'admin.products.brands',
                path: '/admin/products/brands',
                component: lazy(() =>
                    import('@/admin/pages/brands/BrandListPage').then((m) => ({default: m.BrandListPage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Brands',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.products.categories',
                path: '/admin/products/categories',
                component: lazy(() =>
                    import('@/admin/pages/categories/CategoryListPage').then((m) => ({default: m.CategoryListPage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Categories',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.products',
        path: '/admin/products',
        authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            label: 'Products',
            section: 'PRODUCT MANAGEMENT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'store',
        },
        subMenu: [
            {
                key: 'admin.products.list',
                path: '/admin/products',
                component: lazy(() =>
                    import('@/admin/pages/products/ProductListPage').then((m) => ({default: m.ProductListPage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Product List',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                    menuMatch: 'exact',
                },
            },
            {
                key: 'admin.products.on-sale',
                path: '/admin/products/on-sale',
                component: lazy(() =>
                    import('@/admin/pages/products/ProductsOnSalePage').then((m) => ({default: m.ProductsOnSalePage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Products on Sale',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.products.by-category',
                path: '/admin/products/by-category',
                component: lazy(() =>
                    import('@/admin/pages/products/ProductsByCategoryPage').then((m) => ({default: m.ProductsByCategoryPage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Products by Category',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.products.by-brand',
                path: '/admin/products/by-brand',
                component: lazy(() =>
                    import('@/admin/pages/products/ProductsByBrandPage').then((m) => ({default: m.ProductsByBrandPage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Products by Brand',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.imports',
        path: '/admin/imports',
        authority: rolesFor('import:manage'),
        meta: {
            label: 'Imports',
            section: 'PRODUCT MANAGEMENT',
            icon: 'import',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
        subMenu: [
            {
                key: 'admin.images',
                path: '/admin/images',
                component: lazy(() =>
                    import('@/admin/pages/images/ImageGalleryPage').then((m) => ({default: m.ImageGalleryPage}))
                ),
                authority: rolesFor('image:write'),
                meta: {
                    label: 'Image Gallery',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                    menuMatch: 'exact',
                },
            },
            {
                key: 'admin.imports.products',
                path: '/admin/imports/products/list',
                component: lazy(() => import('@/admin/pages/imports/ProductImportListPage')),
                authority: rolesFor('import:manage'),
                meta: {
                    label: 'Product Upload',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.imports.price',
                path: '/admin/imports/products/price/list',
                component: lazy(() => import('@/admin/pages/imports/PriceImportListPage')),
                authority: rolesFor('import:manage'),
                meta: {
                    label: 'Price Changes',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.orders',
        path: '/admin/orders',
        // No component: the parent only expands the section. Its own path is served by
        // the `admin.orders.list` child below, mirroring `admin.products`.
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            label: 'Orders',
            section: 'ORDER MANAGEMENT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'package',
        },
        // ⚠️ Every path here is a literal sitting under `/admin/orders/`, which is also
        // where `/admin/orders/:orderId` lives. React Router ranks static segments above
        // dynamic ones so these win, but the failure mode if that ever changes is silent —
        // the order detail page would render with "returns" as an order id and simply say
        // "Order not found". `orderRoutes.test.ts` pins the resolution for each path.
        subMenu: [
            {
                key: 'admin.orders.list',
                path: '/admin/orders',
                component: lazy(() =>
                    import('@/admin/pages/orders/OrderListPage').then((m) => ({default: m.OrderListPage}))
                ),
                authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'All Orders',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.orders.returns',
                path: '/admin/orders/returns',
                component: lazy(() =>
                    import('@/admin/pages/AdminToDoPage').then((m) => ({default: m.AdminToDoPage}))
                ),
                authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Return & Refund',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.orders.abandoned-carts',
                path: '/admin/orders/abandoned-carts',
                component: lazy(() =>
                    import('@/admin/pages/AdminToDoPage').then((m) => ({default: m.AdminToDoPage}))
                ),
                authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Abandoned Cart',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.orders.transactions',
                path: '/admin/orders/transactions',
                component: lazy(() =>
                    import('@/admin/pages/AdminToDoPage').then((m) => ({default: m.AdminToDoPage}))
                ),
                authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Transactions',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.quotes',
        path: '/admin/quotes',
        component: lazy(() =>
            import('@/admin/pages/quotes/QuoteRequestQueuePage').then((m) => ({
                default: m.QuoteRequestQueuePage,
            }))
        ),
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            label: 'Quote Requests',
            section: 'ORDER MANAGEMENT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'file-spreadsheet',
        },
    },
    {
        key: 'admin.customers',
        path: '/admin/customers',
        component: lazy(() =>
            import('@/admin/pages/customers/retail/CustomerListPage').then((m) => ({default: m.CustomerListPage}))
        ),
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            label: 'Retail',
            section: 'CUSTOMER MANAGEMENT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'users',
        },
    },
    {
        key: 'admin.wholesale',
        path: '/admin/wholesale',
        authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            label: 'Wholesale',
            section: 'CUSTOMER MANAGEMENT',
            icon: 'warehouse',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
        subMenu: [
            {
                key: 'admin.wholesale.applications',
                path: '/admin/wholesale',
                component: lazy(() =>
                    import('@/admin/pages/customers/wholesale/WholesaleApplicationQueuePage').then((m) => ({
                        default: m.WholesaleApplicationQueuePage,
                    }))
                ),
                authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Applications',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                    menuMatch: 'exact',
                },
            },
            {
                key: 'admin.wholesale.customers',
                path: '/admin/wholesale/customers',
                component: lazy(() =>
                    import('@/admin/pages/customers/wholesale/WholesaleCustomerListPage').then((m) => ({
                        default: m.WholesaleCustomerListPage,
                    }))
                ),
                authority: ['SUPER_ADMIN', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Customers',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.storefront.navigation',
        path: '/admin/storefront/navigation',
        component: lazy(() =>
            import('@/admin/pages/storefront-config/NavigationEditorPage').then((m) => ({default: m.NavigationEditorPage}))
        ),
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Navigation',
            section: 'STOREFRONT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'menu',
        },
    },
    {
        key: 'admin.storefront.header',
        path: '/admin/storefront/header',
        component: lazy(() =>
            import('@/admin/pages/storefront-config/announcement/AnnouncementEditorPage').then((m) => ({default: m.AnnouncementEditorPage}))
        ),
        authority: ['SUPER_ADMIN'],
        meta: {
            label: 'Announcement',
            section: 'STOREFRONT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'megaphone',
        },
    },
    {
        key: 'admin.storefront.legal',
        path: '/admin/storefront/legal',
        component: lazy(() =>
            import('@/admin/pages/storefront-config/legal-pages/LegalPagesListPage').then((m) => ({default: m.LegalPagesListPage}))
        ),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Legal',
            section: 'STOREFRONT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'scale',
        },
    },
    {
        key: 'admin.storefront.featured-products',
        path: '/admin/storefront/featured-products',
        component: lazy(() =>
            import('@/admin/pages/storefront-config/FeaturedProductsPage').then((m) => ({default: m.FeaturedProductsPage}))
        ),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Featured Products',
            section: 'STOREFRONT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'star',
        },
    },
    {
        key: 'admin.storefront.contact',
        path: '/admin/storefront/contact',
        component: lazy(() =>
            import('@/admin/pages/storefront-config/contact/ContactEditorPage').then((m) => ({default: m.ContactEditorPage}))
        ),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Contact',
            section: 'STOREFRONT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'mail',
        },
    },
    {
        key: 'admin.storefront.testimonials',
        path: '/admin/storefront/testimonials',
        component: lazy(() =>
            import('@/admin/pages/storefront-config/testimonials/TestimonialsPage').then((m) => ({default: m.TestimonialsPage}))
        ),
        authority: ['SUPER_ADMIN', 'VIEWER'],
        meta: {
            label: 'Testimonials',
            section: 'STOREFRONT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'quote',
        },
    },
    {
        key: 'admin.settings',
        path: '/admin/settings',
        authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
        meta: {
            label: 'Settings',
            section: 'CONFIGURATION',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'settings',
        },
        subMenu: [
            {
                key: 'admin.settings.shipping',
                path: '/admin/settings/shipping',
                component: lazy(() =>
                    import('@/admin/pages/settings/ShippingMethodsPage').then((m) => ({default: m.ShippingMethodsPage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Shipping Methods',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.settings.store',
                path: '/admin/settings/store',
                component: lazy(() =>
                    import('@/admin/pages/settings/StoreSettingsPage').then((m) => ({default: m.StoreSettingsPage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Store Settings',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
            {
                key: 'admin.settings.countries',
                path: '/admin/settings/countries',
                component: lazy(() =>
                    import('@/admin/pages/settings/CountrySettingsPage').then((m) => ({default: m.CountrySettingsPage}))
                ),
                authority: ['SUPER_ADMIN', 'CATALOG_MANAGER', 'ORDER_MANAGER', 'VIEWER'],
                meta: {
                    label: 'Countries',
                    pageBackgroundType: 'plain',
                    pageContainerType: 'contained',
                },
            },
        ],
    },
    {
        key: 'admin.staff',
        path: '/admin/staff',
        component: lazy(() =>
            import('@/admin/pages/staff/StaffListPage').then((m) => ({default: m.StaffListPage}))
        ),
        authority: rolesFor('staff:manage'),
        meta: {
            label: 'Staff',
            section: 'STAFF MANAGEMENT',
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
            icon: 'users',
            menuMatch: 'exact',
        },
    },
]
