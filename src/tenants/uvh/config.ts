import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes';

export const clientUvhStorefrontConfig: StorefrontClientConfig = {
    id: 'uvh',
    stickyHeader: true,
    displayName: 'UVH Holdings',
    hostnames: ['uvhholdings.co.za'],
    branding: {
        name: 'UVH Holdings',
        tagline: 'Wholesale and retail supplier for PPE, medical, cleaning, safety, hospitality and household products.',
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
            {
                id: 'about',
                label: 'About Us',
                to: '/about-us',
            },
            {
                id: 'contact',
                label: 'Contact Us',
                to: '/contact-us',
            },
            {
                id: 'products',
                label: 'Products',
                to: '/products',
            },
        ],
    },
    theme: {
        background: '#f3f4f6',
        panel: '#ffffff',
        text: '#111111',
        mutedText: '#666666',
        accent: '#7a0019',
        accentText: '#ffffff',
        border: '#e5e7eb',

        navBackground: '#111111',
        navText: '#ffffff',
        navTextHover: '#7a0019',
        navBorder: '#1f1f1f',
        navIconText: '#d4d4d4',
        navIconTextHover: '#ffffff',
        surfaceMuted: '#f8fafc',
        ring: '#7a0019',
        radius: '1rem',
        shadowSm: '0 10px 24px -18px rgba(17, 17, 17, 0.45)',
        shadowLg: '0 26px 50px -30px rgba(17, 17, 17, 0.5)',
    },
    pages: {
        variants: {
            home: 'uvh-home',
            products: 'uvh-products',
            contactUs: 'uvh-contact-us',
            aboutUs: 'uvh-about-us',
            termsAndConditions: 'uvh-terms-and-conditions',
            privacyPolicy: 'uvh-privacy-policy',
            deliveryAndReturnsPolicy: 'uvh-delivery-and-returns-policy',
            wholesaleApplication: 'uvh-wholesale-application',
            productDetail: 'uvh-product-detail',
        },
    },
    footer: {
        description: 'Wholesale & retail supplier of PPE, medical, cleaning, safety, hospitality and household products.',
        columns: [
            {
                heading: 'Company',
                links: [
                    {
                        id: 'home',
                        label: 'Home',
                        to: '/'
                    },
                    {
                        id: 'about',
                        label: 'About Us',
                        to: '/about-us'
                    },
                    {
                        id: 'contact',
                        label: 'Contact Us',
                        to: '/contact-us'
                    },
                ],
            },
            {
                heading: 'Shop',
                links: [
                    {
                        id: 'products',
                        label: 'All Products',
                        to: '/products'
                    },
                    {
                        id: 'quote',
                        label: 'Get A Quote',
                        to: '/contact-us'
                    },
                    {
                        id: 'bulk',
                        label: 'Wholesale Support',
                        to: '/wholesale-application'
                    },
                ],
            },
            {
                heading: 'Support',
                links: [
                    {
                        id: 'whatsapp',
                        label: 'WhatsApp Us',
                        to: 'https://wa.me/27768195245',
                        external: true,
                    },
                    {
                        id: 'email-sales',
                        label: 'sales@uvhholdings.co.za',
                        to: 'mailto:sales@uvhholdings.co.za',
                        external: true,
                    },
                ],
            },
        ],
        socialLinks: [
            {
                id: 'instagram',
                label: 'Instagram',
                to: 'https://www.instagram.com/uvh_holdings/',
                icon: 'instagram',
            },
            {
                id: 'facebook',
                label: 'Facebook',
                to: 'https://www.facebook.com/profile.php?id=61550112646739',
                icon: 'facebook',
            },
        ],
        legalLinks: [
            {
                id: 'terms',
                label: 'Terms & Conditions',
                to: '/terms-and-conditions',
            },
            {
                id: 'privacy',
                label: 'Privacy Policy',
                to: '/privacy-policy',
            },
            {
                id: 'delivery-returns',
                label: 'Delivery & Returns Policy',
                to: '/delivery-and-returns-policy',
            },
        ],
    },
};
