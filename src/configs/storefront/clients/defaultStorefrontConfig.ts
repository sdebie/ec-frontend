import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes';
import {defaultHomeSections} from '@/pages/storefront/core/default/home/defaultHomeSections';

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
            {
                id: 'wholesale',
                label: 'Wholesale',
                to: '/wholesale-application',
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
        sections: defaultHomeSections,
    },
    footer: {
        description: 'A flexible demo storefront built for multi-client ecommerce experiences.',
        footerCallout: {
            heading: 'Bulk orders & tenders',
            body: 'Need recurring supply, large quantities, or tender support? Our team can assist quickly.',
        },
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