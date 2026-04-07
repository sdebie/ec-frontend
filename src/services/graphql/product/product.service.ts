import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";
import {
	ProductListItem,
	ProductInformation,
	ProductImage,
	ProductVariant,
	VariantItem,
} from "@/types/admin/ProductTypes.ts";
import {
	GET_PRODUCTS_LIST,
	GET_PRODUCT_AND_VARIANTS,
	PRODUCT_COUNT,
	VARIANTS_BY_IDS,
} from "@/services/graphql/product/product.queries.ts";


const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetProductList(
	categoryName?: string | null,
	pageRequest?: PageRequest | null,
	filterRequest?: FilterRequest | null
): Promise<ProductListItem[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ productList: ProductListItem[] }>(GET_PRODUCTS_LIST, {
		categoryName,
		pageRequest,
		filterRequest,
	});

	return result.productList ?? [];
}

export async function apiGetProductCount(filterRequest?: FilterRequest | null): Promise<number> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ productCount: number }>(PRODUCT_COUNT, {
		filterRequest,
	});

	return result.productCount ?? 0;
}

export async function apiGetVariantsByIds(ids: string[]): Promise<VariantItem[]> {
	if (!ids || ids.length === 0) return [];

	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ variantsByIds: VariantItem[] }>(VARIANTS_BY_IDS, {
		ids,
	});

	return result.variantsByIds ?? [];
}

export async function apiGetProductInformation(productId: string): Promise<ProductInformation | null> {
	if (!productId) return null;

	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	type ProductInformationResponse = {
		product?: {
			id: string;
			slug?: string | null;
			name?: string | null;
			description?: string | null;
			shortDescription?: string | null;
			productType?: string | null;
			createdAt?: string | null;
			categoryId?: string | null;
			brandId?: string | null;
		} | null;
		productImages?: ProductImage[] | null;
		variants?: ProductVariant[] | null;
	};

	const result = await client.request<{ getProductInformation: ProductInformationResponse | null }>(GET_PRODUCT_AND_VARIANTS, {
		productId,
	});

	if (!result.getProductInformation?.product) return null;

	const product = result.getProductInformation.product;

	return {
		productInfo: {
			id: product.id,
			slug: product.slug,
			name: product.name,
			description: product.description,
			short_description: product.shortDescription,
			product_type: product.productType,
			date_created: product.createdAt,
			category_is: product.categoryId,
			brand_id: product.brandId,
		},
		variants: result.getProductInformation.variants,
		images: result.getProductInformation.productImages,
	};
}

export const fetchProductsList = apiGetProductList;
export const fetchVariantsByIds = apiGetVariantsByIds;
export const fetchProductAndVariants = apiGetProductInformation;
export const fetchProductCount = apiGetProductCount;
