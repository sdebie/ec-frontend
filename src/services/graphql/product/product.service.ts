import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";
import {
	ProductListItem,
	ProductShoppingListItem,
	ProductInformation,
	VariantItem,
} from "@/types/admin/ProductTypes.ts";
import {
	GET_PRODUCTS_LIST,
	GET_SHOPPING_PRODUCTS_LIST,
	GET_SALE_PRODUCTS_LIST,
	GET_PRODUCT_AND_VARIANTS,
	GET_TOP_BEST_SELLERS,
	PRODUCT_COUNT,
	VARIANTS_BY_IDS,
} from "@/services/graphql/product/product.queries.ts";


const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetProductList(
	categoryId?: string | null,
	pageRequest?: PageRequest | null,
	filterRequest?: FilterRequest | null
): Promise<ProductListItem[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ productList: ProductListItem[] }>(GET_PRODUCTS_LIST, {
		categoryId,
		pageRequest,
		filterRequest,
	});

	return result.productList ?? [];
}

export async function apiGetShoppingProductsList(
	categoryId?: string | null,
	pageRequest?: PageRequest | null,
	filterRequest?: FilterRequest | null
): Promise<ProductShoppingListItem[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ shoppingProductList: ProductShoppingListItem[] }>(GET_SHOPPING_PRODUCTS_LIST, {
		categoryId,
		pageRequest,
		filterRequest,
	});

	return result.shoppingProductList ?? [];
}

export async function apiGetProductOnSaleList(pageRequest?: PageRequest | null): Promise<ProductShoppingListItem[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ saleProductList: ProductShoppingListItem[] }>(GET_SALE_PRODUCTS_LIST, {
		pageRequest,
	});

	return result.saleProductList ?? [];
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

	const result = await client.request<{ getProductInformation: ProductInformation | null }>(GET_PRODUCT_AND_VARIANTS, {
		productId,
	});

	return result.getProductInformation ?? null;
}

export async function apiGetTopBestSellers(): Promise<ProductShoppingListItem[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ topBestSellers: ProductShoppingListItem[] }>(GET_TOP_BEST_SELLERS);

	return result.topBestSellers ?? [];
}


export const fetchProductsList = apiGetProductList;
export const fetchShoppingProductsList = apiGetShoppingProductsList;
export const fetchSaleProductsList = apiGetProductOnSaleList;
export const fetchVariantsByIds = apiGetVariantsByIds;
export const fetchProductAndVariants = apiGetProductInformation;
export const fetchProductCount = apiGetProductCount;
export const fetchTopBestSellers = apiGetTopBestSellers;
