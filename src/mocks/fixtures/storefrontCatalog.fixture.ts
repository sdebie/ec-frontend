/**
 * Small, renderable slice of the current UVH import seed.
 *
 * The mock API is deliberately a development fallback, not a second source of
 * truth for tests. Keep these values aligned with `uvh_product_upload.csv` and
 * use storage-relative image paths exactly as the real GraphQL API does.
 */
export const storefrontCategoriesFixture = [
  { id: 'mock-category-medical', name: 'Medical', slug: 'medical' },
  { id: 'mock-category-ppe', name: 'PPE', slug: 'ppe' },
  { id: 'mock-category-cleaning', name: 'Cleaning Equipment', slug: 'cleaning-equipment' },
  { id: 'mock-category-safety', name: 'Safety Wear & Equipment', slug: 'safety-wear-equipment' },
  { id: 'mock-category-hygiene', name: 'Hygiene Protection', slug: 'hygiene-protection' },
]

export const storefrontBrandsFixture = [
  { id: 'mock-brand-dromex', name: 'Dromex', slug: 'dromex', logoUrl: 'brands/dromex-logo-300x100.png' },
  { id: 'mock-brand-pioneer', name: 'Pioneer', slug: 'pioneer', logoUrl: 'brands/Prioneer-Safety-300x32.png' },
  { id: 'mock-brand-hygiene', name: 'Hygiene Protection', slug: 'hygiene-protection', logoUrl: null },
]

export const storefrontProductsFixture = [
  {
    id: 'mock-product-smocks-40mic',
    name: 'Smocks Premium Plus 40 micron - 100',
    slug: 'smocks-premium-plus-40-micron-100',
    shortDescription: 'Disposable protective smocks, 100 pack.',
    description: 'Smocks Premium Plus 40 micron - 100.',
    category: storefrontCategoriesFixture[4],
    brand: storefrontBrandsFixture[2],
    images: [{ id: 'mock-image-smocks-40mic', imageUrl: '02/smocks-white-4.webp', featured: true, sortOrder: 0 }],
    retailPrice: { price: 540 }, wholesalePrice: { price: 540 }, retailSalePrice: null, wholesaleSalePrice: null,
    variants: [{ id: 'mock-variant-smocks-40mic', sku: 'SMOCKS-40MIC-PLUS', stockQuantity: 24, attributesJson: '{"Size":""}', prices: [{ priceType: 'RETAIL_PRICE', price: 540 }, { priceType: 'WHOLESALE_PRICE', price: 540 }] }],
  },
  {
    id: 'mock-product-smocks-30mic',
    name: 'Smocks 30 micron - 100',
    slug: 'smocks-30-micron-100',
    shortDescription: 'Disposable protective smocks, 100 pack.',
    description: 'Smocks 30 micron - 100.',
    category: storefrontCategoriesFixture[4],
    brand: storefrontBrandsFixture[2],
    images: [{ id: 'mock-image-smocks-30mic', imageUrl: '02/smocks-white-11.webp', featured: true, sortOrder: 0 }],
    retailPrice: { price: 230 }, wholesalePrice: { price: 230 }, retailSalePrice: { price: 199 }, wholesaleSalePrice: { price: 199 },
    variants: [{ id: 'mock-variant-smocks-30mic', sku: 'SMOCKS-30MIC', stockQuantity: 18, attributesJson: '{"Size":""}', prices: [{ priceType: 'RETAIL_PRICE', price: 230 }, { priceType: 'WHOLESALE_PRICE', price: 230 }, { priceType: 'RETAIL_SALE_PRICE', price: 199 }, { priceType: 'WHOLESALE_SALE_PRICE', price: 199 }] }],
  },
  {
    id: 'mock-product-apron-20mic',
    name: 'Apron 20 micron - 100',
    slug: 'apron-20-micron-100',
    shortDescription: 'Disposable aprons, 100 pack.',
    description: 'Apron 20 micron - 100.',
    category: storefrontCategoriesFixture[4],
    brand: storefrontBrandsFixture[2],
    images: [{ id: 'mock-image-apron-20mic', imageUrl: '02/smocks-white-27.webp', featured: true, sortOrder: 0 }],
    retailPrice: { price: 59 }, wholesalePrice: { price: 59 }, retailSalePrice: null, wholesaleSalePrice: null,
    variants: [{ id: 'mock-variant-apron-20mic', sku: 'APRONS-20MIC', stockQuantity: 30, attributesJson: '{"Size":""}', prices: [{ priceType: 'RETAIL_PRICE', price: 59 }, { priceType: 'WHOLESALE_PRICE', price: 59 }] }],
  },
]

export const storefrontFeaturedProductsFixture = storefrontProductsFixture.slice(0, 3)

