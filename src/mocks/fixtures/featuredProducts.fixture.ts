import { storefrontFeaturedProductsFixture } from './storefrontCatalog.fixture.js'

// REST-shaped mock. The storefront itself reads the GraphQL fixture in
// devApiPlugin, whose shape mirrors ProductShoppingListItemDto.
export const featuredProductsFixture = storefrontFeaturedProductsFixture.map((product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  shortDescription: product.shortDescription,
  retailPrice: product.retailPrice.price,
  primaryImageUrl: product.images[0].imageUrl,
}))
