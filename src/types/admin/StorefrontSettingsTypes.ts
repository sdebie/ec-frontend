import type {StorefrontSectionType} from '@/types/storefront/storefrontTypes';

export const STOREFRONT_SETTING_KEYS = {
    CONFIG: 'storefront.config',
    BRANDING: 'storefront.branding',
    THEME: 'storefront.theme',
    NAVIGATION: 'storefront.navigation',
    FOOTER: 'storefront.footer',
    HOME_SECTIONS: 'storefront.home_sections',
} as const;

export type StorefrontSettingKey = (typeof STOREFRONT_SETTING_KEYS)[keyof typeof STOREFRONT_SETTING_KEYS];

export type StorefrontConfigSection = {
    slug: string;
    displayName: string;
    locale?: string;
    defaultCountryCode?: string;
    stickyHeader?: boolean;
    productsLabel?: string;
};

export type StorefrontBrandingSection = {
    name: string;
    tagline?: string;
    logoSrc?: string;
    logoAlt?: string;
    logoWidth?: number;
    logoHeight?: number;
};

export type StorefrontThemeSection = {
    background: string;
    panel: string;
    text: string;
    mutedText: string;
    accent: string;
    accentText: string;
    border: string;
    navBackground?: string;
    navText?: string;
    navTextHover?: string;
    navBorder?: string;
    navIconText?: string;
    navIconTextHover?: string;
    error?: string;
    success?: string;
    surfaceMuted?: string;
    ring?: string;
    radius?: string;
    shadowSm?: string;
    shadowLg?: string;
};

export type StorefrontNavLinkItem = {
    id: string;
    label: string;
    path: string;
    external?: boolean;
    sortOrder: number;
};

export type StorefrontNavSection = {
    items: StorefrontNavLinkItem[];
};

export type StorefrontFooterLinkItem = {
    id: string;
    label: string;
    path: string;
    external?: boolean;
    sortOrder: number;
};

export type StorefrontFooterColumn = {
    id: string;
    heading: string;
    links: StorefrontFooterLinkItem[];
};

export type StorefrontSocialLinkItem = {
    id: string;
    label: string;
    path: string;
    icon: string;
};

export type StorefrontLegalLinkItem = {
    id: string;
    label: string;
    path: string;
};

export type StorefrontFooterSection = {
    description?: string;
    calloutHeading?: string;
    calloutBody?: string;
    columns: StorefrontFooterColumn[];
    socialLinks: StorefrontSocialLinkItem[];
    legalLinks: StorefrontLegalLinkItem[];
};

export type StorefrontHomeSectionItem = {
    id: string;
    type: StorefrontSectionType;
    sortOrder: number;
    enabled: boolean;
    props: Record<string, unknown>;
};

export type StorefrontSettings = {
    config: StorefrontConfigSection;
    branding: StorefrontBrandingSection;
    theme: StorefrontThemeSection;
    navigation: StorefrontNavSection;
    footer: StorefrontFooterSection;
    homeSections: StorefrontHomeSectionItem[];
};
