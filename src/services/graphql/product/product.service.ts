import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";
import {
	ProductListItem,
	ProductAndVariants,
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

export async function apiGetProductAndVariants(productId: string): Promise<ProductAndVariants | null> {
	if (!productId) return null;

	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ getProductAndVariants: ProductAndVariants }>(GET_PRODUCT_AND_VARIANTS, {
		productId,
	});

	return result.getProductAndVariants ?? null;
}

export const fetchProductsList = apiGetProductList;
export const fetchVariantsByIds = apiGetVariantsByIds;
export const fetchProductAndVariants = apiGetProductAndVariants;
export const fetchProductCount = apiGetProductCount;
