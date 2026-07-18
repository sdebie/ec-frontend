import { storefrontFeaturedProductsFixture } from './storefrontCatalog.fixture'

// Legacy REST mock retained for compatibility. The storefront itself uses the
// GraphQL fixture in devApiPlugin, whose shape mirrors ProductShoppingListItemDto.
export const featuredProductsFixture = storefrontFeaturedProductsFixture.map((product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  shortDescription: product.shortDescription,
  retailPrice: product.retailPrice.price,
  primaryImageUrl: product.images[0].imageUrl,
}))
