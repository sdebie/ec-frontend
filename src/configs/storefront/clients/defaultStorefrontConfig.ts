import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes';

export const defaultStorefrontConfig: StorefrontClientConfig = {
    id: 'default',
    displayName: 'Default Storefront',
    hostnames: ['localhost', '127.0.0.1', 'store.localhost'],
    branding: {
        name: 'E-Comm Demo',
        tagline: 'Everyday essentials delivered fast.',
        logo: {
            src: '/img/default-logo.jpeg',
            alt: 'Default Storefront logo',
            width: 40,
            height: 40,
        },
    },
    navigation: {
        productsLabel: 'Products',
        menuItems: [
            {
                id: 'home',
                label: 'Home',
                to: '/',
            },
            {
                id: 'about',
                label: 'About Us',
                to: '/about-us',
            },
            {
                id: 'contact',
                label: 'Contact',
                to: '/contact-us',
            },
        ],
    },
    theme: {
        background: '#f8fafc',
        panel: '#ffffff',
        text: '#0f172a',
        mutedText: '#64748b',
        accent: '#2563eb',
        accentText: '#ffffff',
        border: '#e2e8f0',
        // NEW: Navigation-specific theme tokens
        navBackground: '#ffffff',
        navText: '#0f172a',
        navTextHover: '#2563eb',
        navBorder: '#e2e8f0',
        navIconText: '#64748b',
        navIconTextHover: '#2563eb',
    },
    home: {
        sections: [
            {
                id: 'hero',
                type: 'hero',
                props: {
                    title: 'Shop smarter, faster, and with confidence',
                    subtitle: 'A flexible demo storefront for modern ecommerce experiences.',
                    backgroundImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80',
                    overlayOpacity: 0.35,
                    contentAlignment: 'center',
                    maxContentWidth: '2xl',
                    darkStyle: false,
                    primaryCta: {
                        label: 'Browse Products',
                        to: '/products',
                    },
                    secondaryCta: {
                        label: 'Learn More',
                        to: '/about-us',
                    },
                },
            },
            {
                id: 'promo-grid',
                type: 'promo-grid',
                props: {
                    title: 'Explore by shopping intent',
                    subtitle: 'Quick ways to discover what matters most.',
                    layout: 'cards',
                    columns: 3,
                    items: [
                        {
                            id: 'new-arrivals',
                            title: 'New Arrivals',
                            description: 'Fresh products added to the catalog.',
                            cta: {
                                label: 'Shop new',
                                to: '/products?sort=new',
                            },
                        },
                        {
                            id: 'best-sellers',
                            title: 'Best Sellers',
                            description: 'Popular picks customers love.',
                            cta: {
                                label: 'View best sellers',
                                to: '/products?sort=popular',
                            },
                        },
                        {
                            id: 'special-offers',
                            title: 'Special Offers',
                            description: 'Limited-time promotions and bundles.',
                            cta: {
                                label: 'See deals',
                                to: '/products?tag=sale',
                            },
                        },
                    ],
                },
            },
            {
                id: 'category-preview',
                type: 'category-preview',
                props: {
                    title: 'Popular categories',
                    layout: 'tiles',
                    columns: 4,
                    items: [
                        {
                            id: 'electronics',
                            label: 'Electronics',
                            to: '/product-category/electronics',
                            description: 'Devices and accessories',
                        },
                        {
                            id: 'home',
                            label: 'Home',
                            to: '/product-category/home',
                        },
                        {
                            id: 'fashion',
                            label: 'Fashion',
                            to: '/product-category/fashion',
                        },
                        {
                            id: 'essentials',
                            label: 'Essentials',
                            to: '/product-category/essentials',
                        },
                    ],
                },
            },
            {
                id: 'testimonials',
                type: 'testimonials',
                props: {
                    title: 'What customers are saying',
                    layout: 'grid',
                    columns: 3,
                    items: [
                        {
                            id: 't1',
                            quote: 'Clean shopping experience and quick ordering.',
                            name: 'Sarah M.',
                            role: 'Store Manager',
                            company: 'Bright Retail',
                        },
                        {
                            id: 't2',
                            quote: 'The storefront is easy to navigate and works great across devices.',
                            name: 'David K.',
                            role: 'Operations Lead',
                            company: 'Urban Supply',
                        },
                        {
                            id: 't3',
                            quote: 'A solid demo setup for testing client storefront variations.',
                            name: 'Lebo N.',
                            role: 'Product Owner',
                            company: 'Next Commerce',
                        },
                    ],
                },
            },
            {
                id: 'newsletter',
                type: 'newsletter',
                props: {
                    title: 'Stay in the loop',
                    description: 'Get updates on new arrivals, offers, and featured collections.',
                    placeholder: 'Enter your email',
                    submitLabel: 'Subscribe',
                    legalText: 'By subscribing, you agree to receive marketing emails.',
                    secondaryLink: {
                        label: 'Privacy Policy',
                        to: '/privacy',
                    },
                    layout: 'inline',
                },
            },
        ],
    },
    footer: {
        description: 'A flexible demo storefront built for multi-client ecommerce experiences.',
        columns: [
            {
                heading: 'Company',
                links: [
                    {
                        id: 'about',
                        label: 'About Us',
                        to: '/about-us',
                    },
                    {
                        id: 'contact',
                        label: 'Contact',
                        to: '/contact-us',
                    },
                    {
                        id: 'blog',
                        label: 'Blog',
                        to: '/blog',
                    },
                ],
            },
            {
                heading: 'Shop',
                links: [
                    {
                        id: 'electronics',
                        label: 'Electronics',
                        to: '/product-category/electronics',
                    },
                    {
                        id: 'home',
                        label: 'Home',
                        to: '/product-category/home',
                    },
                    {
                        id: 'fashion',
                        label: 'Fashion',
                        to: '/product-category/fashion',
                    },
                ],
            },
        ],
        socialLinks: [
            {
                id: 'facebook',
                label: 'Facebook',
                to: 'https://facebook.com',
                icon: 'facebook',
            },
            {
                id: 'instagram',
                label: 'Instagram',
                to: 'https://instagram.com',
                icon: 'instagram',
            },
        ],
        legalLinks: [
            {
                id: 'privacy',
                label: 'Privacy Policy',
                to: '/privacy',
            },
            {
                id: 'terms',
                label: 'Terms & Conditions',
                to: '/terms',
            },
        ],
    },
};