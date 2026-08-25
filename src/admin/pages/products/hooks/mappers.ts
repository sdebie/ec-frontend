import type {
  AdminProductVariant,
  ProductInformationDtoInput,
  ProductPayload,
  ProductVariantDtoInput,
  VariantAttribute,
} from '../types'

/**
 * Serializes a variant's attribute rows to the wire's `attributesJson` string.
 * Always returns a valid JSON object — `'{}'` for no attributes — never `null`
 * or omitted: the backend only overwrites `attributesJson` on update when the
 * incoming value is non-null, so sending nothing would leave a cleared
 * attribute list unchanged on the server.
 */
export function serializeAttributes(attributes: VariantAttribute[]): string {
  const entries = attributes
    .map(({ key, value }) => [key.trim(), value.trim()] as const)
    .filter(([key, value]) => key.length > 0 && value.length > 0)
  return JSON.stringify(Object.fromEntries(entries))
}

/** Parses a variant's `attributesJson` wire string back into ordered rows for the form. */
export function parseAttributesJson(json: string | null | undefined): VariantAttribute[] {
  if (!json) return []
  try {
    const parsed: unknown = JSON.parse(json)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return []
    return Object.entries(parsed as Record<string, unknown>).map(([key, value]) => ({
      key,
      value: String(value),
    }))
  } catch {
    return []
  }
}

/**
 * Maps the form's flat ProductPayload to the GraphQL ProductInformationDtoInput shape.
 * - Each variant's `price` → exactly one RETAIL_PRICE entry
 * - Each variant's `stock` → `stockQuantity`
 * - Each variant's `attributes` → `attributesJson` (see `serializeAttributes`)
 * - Product images are carried on payload variant index 0 with featured/sortOrder
 * - The server determines the actual DB image-owner variant; we do NOT infer it client-side
 */
export function toProductInformationInput(payload: ProductPayload): ProductInformationDtoInput {
  const variants: ProductVariantDtoInput[] = payload.variants.map((v: AdminProductVariant, index) => {
    const variant: ProductVariantDtoInput = {
      ...(v.id ? { id: v.id } : {}),
      sku: v.sku,
      stockQuantity: v.stock,
      attributesJson: serializeAttributes(v.attributes),
      prices: [
        {
          ...(v.priceId ? { id: v.priceId } : {}),
          priceType: 'RETAIL_PRICE',
          price: v.price,
        },
        // A blank wholesale field sends nothing: the backend upserts only what
        // it receives and never deletes omitted price rows (sale prices ride
        // on that guarantee), so blank means "leave any existing row as-is".
        ...(v.wholesalePrice?.trim()
          ? [{
              ...(v.wholesalePriceId ? { id: v.wholesalePriceId } : {}),
              priceType: 'WHOLESALE_PRICE',
              price: v.wholesalePrice,
            }]
          : []),
      ],
    }

    // Carry the product image manifest on variant index 0
    if (index === 0 && payload.images.length > 0) {
      variant.images = payload.images.map((image, imgIndex) => ({
        ...(payload.imageIds?.[image.url] ? { id: payload.imageIds[image.url] } : {}),
        imageUrl: image.url,
        featured: imgIndex === 0,
        sortOrder: imgIndex,
        // Blank alt text is stored as NULL, matching images that never had one
        altText: image.altText?.trim() ? image.altText.trim() : null,
      }))
    }

    return variant
  })

  return {
    product: {
      name: payload.name,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      description: payload.description,
      status: payload.status,
      categories: payload.categoryIds.map((id) => ({ id })),
    },
    variants,
  }
}
