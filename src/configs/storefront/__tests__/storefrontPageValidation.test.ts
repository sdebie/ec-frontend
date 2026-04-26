import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {StorefrontPageKey} from '@/types/storefront/storefrontPageKeys.ts'

const {
  mockStoreMenuRoutes,
  mockStoreRoutingRoutes,
  mockStorefrontPageRegistry,
  mockStorefrontPageVariantRegistry,
  mockStorefrontRegistry,
} = vi.hoisted(() => {
  const menuRoutes = [
    { key: 'home', path: '/', component: vi.fn(), authority: [], meta: {} },
    { key: 'products', path: '/products', component: vi.fn(), authority: [], meta: {} },
    { key: 'cart', path: '/cart', component: vi.fn(), authority: [], meta: {} },
    { key: 'contactUs', path: '/contact-us', component: vi.fn(), authority: [], meta: {} },
    { key: 'aboutUs', path: '/about-us', component: vi.fn(), authority: [], meta: {} },
  ]

  const routingRoutes = [
    ...menuRoutes,
    { key: 'productDetail', path: '/product/:productId', component: vi.fn(), authority: [], meta: {} },
    { key: 'checkout', path: '/checkout', component: vi.fn(), authority: [], meta: {} },
    { key: 'paymentSuccess', path: '/payment-success', component: vi.fn(), authority: [], meta: {} },
    { key: 'accessDenied', path: '/access-denied', component: vi.fn(), authority: [], meta: {} },
  ]

  const pageRegistry = {
    home: vi.fn(),
    products: vi.fn(),
    cart: vi.fn(),
    productDetail: vi.fn(),
    checkout: vi.fn(),
    paymentSuccess: vi.fn(),
    accessDenied: vi.fn(),
    contactUs: vi.fn(),
    aboutUs: vi.fn(),
  }

  const variantRegistry: Partial<Record<StorefrontPageKey, Record<string, unknown>>> = {
    products: {
      'uvh-products': vi.fn(),
    },
    contactUs: {
      'uvh-contact-us': vi.fn(),
    },
    aboutUs: {
      'uvh-about-us': vi.fn(),
    },
  }

  const storefrontRegistry: Record<string, any> = {
    default: {
      id: 'default',
      displayName: 'Default Storefront',
      hostnames: ['localhost'],
      branding: { name: 'Default' },
      navigation: {
        menuItems: [
          { id: 'home', label: 'Home', to: '/' },
          { id: 'about', label: 'About', to: '/about-us' },
          { id: 'contact', label: 'Contact', to: '/contact-us' },
        ],
      },
      theme: {
        background: '#fff',
        panel: '#fff',
        text: '#000',
        mutedText: '#666',
        accent: '#06f',
        accentText: '#fff',
        border: '#ddd',
      },
      pages: {
        variants: {
          products: 'uvh-products',
        },
      },
      home: { sections: [] },
      footer: {},
    },
  }

  return {
    mockStoreMenuRoutes: menuRoutes,
    mockStoreRoutingRoutes: routingRoutes,
    mockStorefrontPageRegistry: pageRegistry,
    mockStorefrontPageVariantRegistry: variantRegistry,
    mockStorefrontRegistry: storefrontRegistry,
  }
})

vi.mock('@/configs/routes/store/storeMenuRoutes.config.ts', () => ({
  storeMenuRoutes: mockStoreMenuRoutes,
}))

vi.mock('@/configs/routes/store/storePageRoutes.config.ts', () => ({
  storeRoutingRoutes: mockStoreRoutingRoutes,
}))

vi.mock('@/configs/storefront/storefrontPageRegistry.ts', () => ({
  storefrontPageRegistry: mockStorefrontPageRegistry,
  storefrontPageVariantRegistry: mockStorefrontPageVariantRegistry,
}))

vi.mock('@/configs/storefront/storefrontRegistry.ts', () => ({
  getStorefrontRegistry: () => mockStorefrontRegistry,
}))

import { validateStorefrontPageInfrastructure } from '@/configs/storefront/storefrontPageValidation.ts'

function resetMocks() {
  Object.keys(mockStorefrontRegistry).forEach((key) => {
    delete mockStorefrontRegistry[key]
  })

  mockStorefrontRegistry.default = {
    id: 'default',
    displayName: 'Default Storefront',
    hostnames: ['localhost'],
    branding: { name: 'Default' },
    navigation: {
      menuItems: [
        { id: 'home', label: 'Home', to: '/' },
        { id: 'about', label: 'About', to: '/about-us' },
        { id: 'contact', label: 'Contact', to: '/contact-us' },
      ],
    },
    theme: {
      background: '#fff',
      panel: '#fff',
      text: '#000',
      mutedText: '#666',
      accent: '#06f',
      accentText: '#fff',
      border: '#ddd',
    },
    pages: {
      variants: {
        products: 'uvh-products',
      },
    },
    home: { sections: [] },
    footer: {},
  }
}

describe('validateStorefrontPageInfrastructure', () => {
  beforeEach(() => {
    resetMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('does not throw and returns { valid, warnings }', () => {
    expect(() => validateStorefrontPageInfrastructure()).not.toThrow()

    const result = validateStorefrontPageInfrastructure()
    expect(result).toHaveProperty('valid')
    expect(result).toHaveProperty('warnings')
    expect(Array.isArray(result.warnings)).toBe(true)
  })

  it('warns when a client variant key is invalid', () => {
    mockStorefrontRegistry.default.pages = {
      variants: {
        products: 'uvh-products',
        invalidPageKey: 'some-variant',
      } as any,
    }

    const result = validateStorefrontPageInfrastructure()
    expect(result.warnings.some((w) => w.includes('unknown page variant key "invalidPageKey"'))).toBe(true)
  })

  it('warns when a client variant id does not exist for a valid key', () => {
    mockStorefrontRegistry.default.pages = {
      variants: {
        products: 'does-not-exist',
      },
    }

    const result = validateStorefrontPageInfrastructure()
    expect(result.warnings.some((w) => w.includes('unknown variant id "does-not-exist" for page "products"'))).toBe(true)
  })

  it('warns when a non-external nav item path is unknown', () => {
    mockStorefrontRegistry.default.navigation.menuItems = [
      { id: 'home', label: 'Home', to: '/' },
      { id: 'broken', label: 'Broken', to: '/not-a-real-route' },
    ]

    const result = validateStorefrontPageInfrastructure()
    expect(result.warnings.some((w) => w.includes('points to unknown internal path "/not-a-real-route"'))).toBe(true)
  })

  it('warns when nav item ids are duplicated per client', () => {
    mockStorefrontRegistry.default.navigation.menuItems = [
      { id: 'dup', label: 'One', to: '/' },
      { id: 'dup', label: 'Two', to: '/about-us' },
    ]

    const result = validateStorefrontPageInfrastructure()
    expect(result.warnings.some((w) => w.includes('duplicate navigation item id "dup"'))).toBe(true)
  })
})


