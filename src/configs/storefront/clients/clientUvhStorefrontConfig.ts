import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes';

export const clientUvhStorefrontConfig: StorefrontClientConfig = {
    id: 'uvh',
    displayName: 'UVH Holdings',
    hostnames: ['uvhholdings.co.za'],
    branding: {
        name: 'UVH Holdings',
        tagline: 'Wholesale & retail supplier for PPE, medical, cleaning, safety, hospitality and household products.',
        logo: {
            src: '/img/uvh-logo.png',
            alt: 'UVH Holdings logo',
            width: 50,
            height: 50,
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
            // {
            //     id: 'products',
            //     label: 'Products',
            //     to: '/shop',
            // },
            {
                id: 'about',
                label: 'About Us',
                to: '/about',
            },
            {
                id: 'contact',
                label: 'Contact Us',
                to: '/contact',
            },
            {
                id: 'blog',
                label: 'Blog',
                to: '/blog',
            },
            {
                id: 'quote',
                label: 'Get A Quote',
                to: '/get-a-quote',
            },
        ],
    },
    theme: {
        background: '#f8fafc',
        panel: '#ffffff',
        text: '#0f172a',
        mutedText: '#64748b',
        accent: '#1d4ed8',
        accentText: '#ffffff',
        border: '#e2e8f0',

        navBackground: '#0f172a',
        navText: '#ffffff',
        navTextHover: '#93c5fd',
        navBorder: '#1e293b',
        navIconText: '#cbd5e1',
        navIconTextHover: '#ffffff',
    },
    home: {
        sections: [
            {
                id: 'hero',
                type: 'hero',
                props: {
                    title: 'Built for modern procurement teams',
                    subtitle: 'Premium essentials for healthcare, hospitality, and industrial operations.',
                    backgroundImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80',
                    overlayOpacity: 0.5,
                    contentAlignment: 'center',
                    maxContentWidth: '2xl',
                    darkStyle: true,
                    primaryCta: {
                        label: 'Browse Products',
                        to: '/products',
                    },
                    secondaryCta: {
                        label: 'Get A Quote',
                        to: '/get-a-quote',
                    },
                },
            },
            {
                id: 'promo-grid',
                type: 'promo-grid',
                props: {
                    title: 'Shop by business need',
                    subtitle: 'Quick paths into common buying intents.',
                    layout: 'cards',
                    columns: 3,
                    items: [
                        {
                            id: 'bulk-orders',
                            title: 'Bulk Orders',
                            description: 'Volume-focused pricing and fulfillment.',
                            cta: {label: 'View bulk options', to: '/products?tag=bulk'},
                        },
                        {
                            id: 'new-arrivals',
                            title: 'New Arrivals',
                            description: 'Recently added catalog items.',
                            cta: {label: 'See new products', to: '/products?sort=new'},
                        },
                        {
                            id: 'seasonal',
                            title: 'Seasonal Deals',
                            description: 'Limited campaigns and bundled offers.',
                            cta: {label: 'Explore deals', to: '/products?tag=seasonal'},
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
                            id: 'ppe',
                            label: 'PPE',
                            to: '/product-category/ppe',
                            description: 'Workwear and protection'
                        },
                        {
                            id: 'medical',
                            label: 'Medical',
                            to: '/product-category/medical'
                        },
                        {
                            id: 'cleaning',
                            label: 'Cleaning',
                            to: '/product-category/cleaning'
                        },
                        {
                            id: 'hospitality',
                            label: 'Hospitality',
                            to: '/product-category/hospitality'
                        },
                    ],
                },
            },
            {
                id: 'testimonials',
                type: 'testimonials',
                props: {
                    title: 'Trusted by procurement teams',
                    layout: 'grid',
                    columns: 3,
                    items: [
                        {
                            id: 't1',
                            quote: 'Reliable supply and quick turnaround every month.',
                            name: 'A. Naidoo',
                            role: 'Operations Manager',
                            company: 'Northline Services',
                        },
                        {
                            id: 't2',
                            quote: 'Pricing consistency made budgeting much easier.',
                            name: 'J. Smith',
                            role: 'Buyer',
                            company: 'Urban Foods',
                        },
                        {
                            id: 't3',
                            quote: 'The catalog is broad enough for all our branches.',
                            name: 'L. Daniels',
                            role: 'Procurement Lead',
                            company: 'Meridian Retail',
                        },
                    ],
                },
            },
            {
                id: 'newsletter',
                type: 'newsletter',
                props: {
                    title: 'Get monthly product updates',
                    description: 'New stock alerts, promos, and planning tips.',
                    placeholder: 'Enter your email',
                    submitLabel: 'Subscribe',
                    legalText: 'By subscribing, you agree to receive marketing emails.',
                    secondaryLink:
                        {
                            label: 'Privacy Policy',
                            to: '/privacy'
                        },
                    layout: 'inline',
                },
            },
        ],
    },
    footer: {
        description: 'Wholesale & retail supplier of PPE, medical, cleaning, safety, hospitality and household products.',
        columns: [
            {
                heading: 'Company',
                links: [
                    {
                        id: 'about',
                        label: 'About Us',
                        to: '/about'
                    },
                    {
                        id: 'blog',
                        label: 'Blog',
                        to: '/blog'
                    },
                    {
                        id: 'contact',
                        label: 'Contact Us',
                        to: '/contact'
                    },
                ],
            },
            {
                heading: 'Shop',
                links: [
                    {
                        id: 'ppe',
                        label: 'Workwear & PPE',
                        to: '/product-category/workwear-ppe'
                    },
                    {
                        id: 'medical',
                        label: 'Medical',
                        to: '/product-category/medical'
                    },
                    {
                        id: 'household',
                        label: 'Household',
                        to: '/product-category/household'
                    },
                ],
            },
        ],
        socialLinks: [
            {
                id: 'facebook',
                label: 'Facebook',
                to: 'https://facebook.com/uvhholdings',
                icon: 'facebook'
            },
            {
                id: 'linkedin',
                label: 'LinkedIn',
                to: 'https://linkedin.com/company/uvhholdings',
                icon: 'linkedin'
            },
        ],
        legalLinks: [
            {
                id: 'privacy',
                label: 'Privacy Policy',
                to: '/privacy'
            },
            {
                id: 'terms',
                label: 'Terms & Conditions',
                to: '/terms'
            },
        ],
    },
};