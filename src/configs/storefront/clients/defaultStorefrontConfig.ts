import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes';

export const defaultStorefrontConfig: StorefrontClientConfig = {
    id: 'default',
    displayName: 'Default Storefront',
    hostnames: ['localhost', '127.0.0.1', 'store.localhost'],
    branding: {
        name: 'E-Comm Demo',
        tagline: 'Everyday essentials delivered fast.',
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
                to: '/about',
            },
            {
                id: 'contact',
                label: 'Contact',
                to: '/contact',
            },
            {
                id: 'blog',
                label: 'Blog',
                to: 'https://blog.example.com',
                external: true,
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
            // ... rest of config
        ],
    },
};
