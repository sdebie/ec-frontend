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
    { id: 'home',         label: 'Home',       path: '/',           external: false, sortOrder: 0 },
    { id: 'products',     label: 'Products',   path: '/products',   external: false, sortOrder: 1 },
    { id: 'nav-specials', label: 'Specials',   path: '/specials',   external: false, sortOrder: 2 },
    { id: 'about',        label: 'About Us',   path: '/about-us',   external: false, sortOrder: 3 },
    { id: 'contact',      label: 'Contact Us', path: '/contact-us', external: false, sortOrder: 4 },
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
        backgroundImageUrl: 'storefront/uvh-hero-new.png',
        overlayOpacity: 0.55,
        contentAlignment: 'left',
        darkStyle: true,
      },
    },
    {
      id: 'sale-products-1',
      type: 'sale-products',
      props: {
        title: 'Specials',
        limit: 8,
      },
    },
    {
      id: 'featured-1',
      type: 'featured-products',
      props: {
        title: 'Featured Products',
        limit: 8,
      },
    },
    {
      id: 'brands-1',
      type: 'brands',
      props: {
        heading: 'Our Brands',
      },
    },
    {
      id: 'category-showcase-medical', type: 'category-showcase', props: {
        title: 'Medical Supplies', categorySlug: 'medical', themeColor: '#0EA5E9',
        gradient: 'linear-gradient(90deg, rgba(14, 165, 233, 1) 0%, rgba(29, 78, 216, 1) 50%, rgba(2, 6, 23, 1) 100%)', imageUrl: 'storefront/medical.png',
      },
    },
    {
      id: 'category-showcase-ppe', type: 'category-showcase', props: {
        title: 'PPE & Protective Equipment', categorySlug: 'ppe', themeColor: '#DC2626',
        gradient: 'linear-gradient(90deg, rgba(220, 38, 38, 1) 0%, rgba(185, 28, 28, 1) 50%, rgba(12, 10, 9, 1) 100%)', imageUrl: 'storefront/ppe.png',
      },
    },
    {
      id: 'category-showcase-cleaning', type: 'category-showcase', props: {
        title: 'Cleaning & Equipment', categorySlug: 'cleaning-equipment', themeColor: '#16A34A',
        gradient: 'linear-gradient(90deg, rgba(22, 163, 74, 1) 0%, rgba(5, 150, 105, 1) 50%, rgba(2, 6, 23, 1) 100%)', imageUrl: 'storefront/cleaning-equipment.png',
      },
    },
    {
      id: 'category-showcase-safety', type: 'category-showcase', props: {
        title: 'Safety Wear & Equipment', categorySlug: 'safety-wear-equipment', themeColor: '#FACC15',
        gradient: 'linear-gradient(90deg, rgba(250, 204, 21, 1) 0%, rgba(202, 138, 4, 1) 50%, rgba(12, 10, 9, 1) 100%)', imageUrl: 'storefront/safety-wear-equipment.png',
      },
    },
    {
      id: 'accreditors-1', type: 'accreditors', props: {
        heading: 'Accreditors', items: [
          { id: 'acc-sabs', name: 'SABS', logoUrl: 'storefront/sabs-logo.png', url: 'https://www.sabs.co.za' },
          { id: 'acc-sahpra', name: 'SAHPRA', logoUrl: 'storefront/sahpra-logo.png', url: 'https://www.sahpra.org.za' },
          { id: 'acc-safripol', name: 'Safripol', logoUrl: 'storefront/safripol-logo.png', url: 'https://www.safripol.com' },
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
