import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

export const storefrontConfigFixture: StorefrontConfig = {
  clientId: 'uvh',
  clientName: 'UVH Holdings',
  currency: 'ZAR',
  locale: 'en-ZA',
  stickyHeader: true,

  branding: {
    name: 'UVH Holdings',
    logo: {
      src: '/static/images/uvh-logo.png',
      alt: 'UVH Holdings logo',
    },
  },

  theme: {
    background:       '#f3f4f6',
    panel:            '#ffffff',
    text:             '#111111',
    mutedText:        '#666666',
    accent:           '#7a0019',
    accentText:       '#ffffff',
    border:           '#e5e7eb',
    navBackground:    '#111111',
    navText:          '#ffffff',
    navTextHover:     '#7a0019',
    navBorder:        '#1f1f1f',
    navIconText:      '#d4d4d4',
    navIconTextHover: '#ffffff',
    surfaceMuted:     '#f8fafc',
    ring:             '#7a0019',
    radius:           '1rem',
    shadowSm:         '0 10px 24px -18px rgba(17, 17, 17, 0.45)',
    shadowLg:         '0 26px 50px -30px rgba(17, 17, 17, 0.5)',
  },

  header: {
    announcement: {
      enabled: true,
      text: 'Free delivery on orders over R1 500 — nationwide.',
      backgroundColor: '#7a0019',
      textColor: '#ffffff',
    },
  },

  nav: [
    { id: 'home',     label: 'Home',       path: '/',           external: false, sortOrder: 0 },
    { id: 'products', label: 'Products',   path: '/products',   external: false, sortOrder: 1 },
    { id: 'about',    label: 'About Us',   path: '/about-us',   external: false, sortOrder: 2 },
    { id: 'contact',  label: 'Contact Us', path: '/contact-us', external: false, sortOrder: 3 },
  ],

  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      props: {
        title: 'South Africa\'s Trusted Wholesale Supplier',
        subtitle: 'PPE, medical, cleaning, safety, hospitality and household products — supplied at competitive wholesale and retail prices.',
        primaryCta:    { label: 'Shop Now',    to: '/products' },
        secondaryCta:  { label: 'Contact Us',  to: '/contact-us' },
        backgroundImageUrl: '/static/images/hero-warehouse.jpg',
        overlayOpacity: 0.55,
        contentAlignment: 'left',
        darkStyle: true,
      },
    },
    {
      id: 'featured-1',
      type: 'featured-products',
      props: {
        title: 'Featured Products',
        limit: 3,
      },
    },
    {
      id: 'categories-1',
      type: 'category-preview',
      props: {
        title: 'Shop by Category',
        subtitle: 'Browse our full range of wholesale and retail product lines.',
        layout: 'tiles',
        columns: 4,
        items: [
          { id: 'cat-ppe',         label: 'PPE',               to: '/products?category=ppe',         description: 'Gloves, masks, coveralls and more' },
          { id: 'cat-medical',     label: 'Medical',           to: '/products?category=medical',     description: 'First aid, diagnostics and consumables' },
          { id: 'cat-cleaning',    label: 'Cleaning & Hygiene',to: '/products?category=cleaning',    description: 'Industrial and household cleaning supplies' },
          { id: 'cat-safety',      label: 'Safety',            to: '/products?category=safety',      description: 'Hard hats, signage, fire safety' },
          { id: 'cat-hospitality', label: 'Hospitality',       to: '/products?category=hospitality', description: 'Linen, kitchenware and guest amenities' },
          { id: 'cat-household',   label: 'Household',         to: '/products?category=household',   description: 'Everyday home essentials in bulk' },
        ],
      },
    },
    {
      id: 'benefits-1',
      type: 'benefits',
      props: {
        title: 'Why Choose UVH Holdings',
        items: [
          { title: 'Nationwide Delivery',      description: 'Fast, reliable delivery to all major centres across South Africa.' },
          { title: 'Wholesale & Retail',       description: 'Competitive pricing for bulk orders — no minimum order quantity required.' },
          { title: 'Dedicated Account Manager',description: 'Registered wholesale customers receive a dedicated account manager.' },
          { title: 'Quality Assured Products', description: 'All products meet South African quality and safety standards.' },
        ],
      },
    },
    {
      id: 'cta-1',
      type: 'cta',
      props: {
        title: 'Ready to Place an Order?',
        description: 'Register as a wholesale customer to unlock bulk pricing and account credit.',
        cta: { label: 'Apply for a wholesaler account', to: '/wholesale-application' },
      },
    },
  ],
}
