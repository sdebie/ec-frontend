import type {StorefrontPageKey} from '@/types/storefront/storefrontPageKeys.ts';

export type StorefrontClientId = string;

export type StorefrontSectionType =
    | 'hero'
    | 'featured-products'
    | 'benefits'
    | 'cta'
    | 'promo-grid'
    | 'category-preview'
    | 'testimonials'
    | 'newsletter';

export type StorefrontActionLink = Pick<NavMenuItem, 'label' | 'to'>;

export type PromoGridLayout = 'cards' | 'feature-first';

export type PromoGridColumns = 2 | 3 | 4;

export interface PromoGridItem {
    id: string;
    title: string;
    description?: string;
    eyebrow?: string;
    cta?: StorefrontActionLink;
}

export interface PromoGridSectionProps {
    title: string;
    subtitle?: string;
    layout?: PromoGridLayout;
    columns?: PromoGridColumns;
    items: PromoGridItem[];
}

export type CategoryPreviewLayout = 'tiles' | 'list';

export type CategoryPreviewColumns = 2 | 3 | 4 | 6;

export interface CategoryPreviewItem extends NavMenuItem {
    description?: string;
    imageSrc?: string;
    imageAlt?: string;
}

export interface CategoryPreviewSectionProps {
    title: string;
    subtitle?: string;
    layout?: CategoryPreviewLayout;
    columns?: CategoryPreviewColumns;
    items: CategoryPreviewItem[];
}

export type TestimonialsLayout = 'grid' | 'stacked';

export type TestimonialsColumns = 1 | 2 | 3;

export interface TestimonialItem {
    id: string;
    quote: string;
    name: string;
    role?: string;
    company?: string;
}

export interface TestimonialsSectionProps {
    title: string;
    subtitle?: string;
    layout?: TestimonialsLayout;
    columns?: TestimonialsColumns;
    items: TestimonialItem[];
}

export type NewsletterLayout = 'inline' | 'stacked';

export interface NewsletterSectionProps {
    title: string;
    description?: string;
    placeholder?: string;
    submitLabel: string;
    legalText?: string;
    secondaryLink?: StorefrontActionLink;
    layout?: NewsletterLayout;
}

export interface NavMenuItem {
    id: string;
    label: string;
    to: string;
    external?: boolean; // for external links
}

export interface StorefrontNavigation {
    productsLabel?: string;
    menuItems?: NavMenuItem[]; // NEW: configurable menu
}

// Add to StorefrontTheme interface in storefrontTypes.ts:
export interface StorefrontTheme {
    background: string;
    panel: string;
    text: string;
    mutedText: string;
    accent: string;
    accentText: string;
    border: string;

    // NEW: Navigation-specific theme tokens
    navBackground?: string;
    navText?: string;
    navTextHover?: string;
    navBorder?: string;
    navIconText?: string;
    navIconTextHover?: string;

    // NEW: Status tokens
    error?: string;
    success?: string;

    // Optional surface and interaction tokens for storefront visual polish
    surfaceMuted?: string;
    ring?: string;
    radius?: string;
    shadowSm?: string;
    shadowLg?: string;
}

export interface StorefrontBrandLogo {
    src: string;       // URL or local asset path
    alt: string;
    width?: number;
    height?: number;
}

export interface StorefrontBranding {
    name: string;
    tagline?: string;
    logo?: StorefrontBrandLogo;
}

export interface FooterLinkColumn {
    heading: string;
    links: NavMenuItem[];         // reuses the existing link shape directly
}

export interface FooterSocialLink {
    id: string;
    label: string;                // doubles as aria-label
    to: string;
    icon: string;                 // e.g. 'facebook' | 'linkedin' — resolved at render time
}

export interface FooterConfig {
    description?: string;
    /** Optional card under the description (e.g. bulk / tender support). Omit to hide. */
    footerCallout?: {
        heading: string;
        body: string;
    };
    columns?: FooterLinkColumn[];
    socialLinks?: FooterSocialLink[];
    legalLinks?: NavMenuItem[];   // reuses the existing link shape directly
}

export type StorefrontSlotId =
    // Shell-level (rendered by StorefrontShell without page-component involvement)
    | 'layout.header'        // above the page header — full-bleed banners
    | 'layout.below-header'  // between header and main — announcement bars, promo strips
    | 'layout.footer'        // below the footer — cookie banners, legal notices
    | 'store.nav'            // between header and main — secondary navigation bars
    // Page-level (place <StorefrontSlot> in the relevant page component to activate)
    | 'product.above-purchase'   // product detail, above the add-to-cart panel
    | 'cart.above-checkout'      // cart view, above the checkout button
    // Escape hatch — any string is accepted; TypeScript still offers autocomplete for the above
    | (string & {});

export interface StorefrontSlotContribution {
    id: string;
    slot: StorefrontSlotId;
    order?: number;
    content: {
        title?: string;
        description?: string;
    };
}

export type StorefrontCmsHeroBlock = {
    id: string;
    type: 'hero';
    content: {
        title?: string;
        subtitle?: string;
    };
}

export type StorefrontCmsRichTextBlock = {
    id: string;
    type: 'rich-text';
    content: {
        body?: string;
    };
}

export type StorefrontCmsCtaBlock = {
    id: string;
    type: 'cta';
    content: {
        title?: string;
        description?: string;
    };
}

export type StorefrontCmsBlock =
    | StorefrontCmsHeroBlock
    | StorefrontCmsRichTextBlock
    | StorefrontCmsCtaBlock

export interface StorefrontCmsPageDefinition {
    path: string;
    title: string;
    blocks: StorefrontCmsBlock[];
}

export type HeroContentAlignment = 'left' | 'center' | 'right';

export type HeroContentMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface HeroSectionProps {
    title: string;
    subtitle?: string;
    primaryCta?: StorefrontActionLink;
    secondaryCta?: StorefrontActionLink;

    // New optional visual hero controls (all data-driven, client-configurable)
    backgroundImageUrl?: string;
    overlayOpacity?: number; // 0..1
    contentAlignment?: HeroContentAlignment;
    maxContentWidth?: HeroContentMaxWidth;
    darkStyle?: boolean;
}

export interface FeaturedProductsSectionProps {
    title: string;
    category?: string;
    limit?: number;
}

export interface BenefitsSectionProps {
    title: string;
    items: Array<{
        title: string;
        description: string;
    }>;
}

export interface CtaSectionProps {
    title: string;
    description?: string;
    cta: StorefrontActionLink;
}

type StorefrontSectionBase<TType extends StorefrontSectionType, TProps> = {
    id: string;
    type: TType;
    enabled?: boolean;
    props: TProps;
};

export type StorefrontSectionConfig =
    | StorefrontSectionBase<'hero', HeroSectionProps>
    | StorefrontSectionBase<'featured-products', FeaturedProductsSectionProps>
    | StorefrontSectionBase<'benefits', BenefitsSectionProps>
    | StorefrontSectionBase<'cta', CtaSectionProps>
    | StorefrontSectionBase<'promo-grid', PromoGridSectionProps>
    | StorefrontSectionBase<'category-preview', CategoryPreviewSectionProps>
    | StorefrontSectionBase<'testimonials', TestimonialsSectionProps>
    | StorefrontSectionBase<'newsletter', NewsletterSectionProps>;

/**
 * A route that exists only for a specific tenant and has no canonical page key.
 * The component is resolved from the convention registry: tenants/{tenantId}/pages/{key}/page.tsx
 */
export interface TenantExtraRoute {
    key: string;
    path: string;
    meta?: {
        layout?: 'default' | 'plain' | 'full' | 'shop';
        title?: string;
    };
}

export interface StorefrontClientConfig {
    id: StorefrontClientId;
    stickyHeader?: boolean;
    displayName: string;
    hostnames: string[];
    locale?: string;
    defaultCountryCode?: string;
    branding: StorefrontBranding;
    navigation: StorefrontNavigation;
    theme: StorefrontTheme;
    pages?: {
        variants?: Partial<Record<StorefrontPageKey, string>>;
        cms?: StorefrontCmsPageDefinition[];
    };
    routes?: {
        extra?: TenantExtraRoute[];
    };
    slots?: StorefrontSlotContribution[];
    home?: {
        sections: StorefrontSectionConfig[];
    };
    footer: FooterConfig;
}
