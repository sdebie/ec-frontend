import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";
import {
	GET_PRODUCTS_LIST,
	GET_PRODUCT_WITH_VARIANTS,
	PRODUCT_COUNT,
	VARIANTS_BY_IDS,
} from "@/services/graphql/product/product.queries.ts";

export type ProductImage = {
	id: string;
	imageUrl: string;
	sortOrder?: number | null;
	isFeatured?: boolean | null;
};

export type ProductListItem = {
	id: string;
	name: string;
	description?: string | null;
	retailPrice?: number | null;
	retailSalesPrice?: number | null;
	wholesalePrice?: number | null;
	wholesaleSalesPrice?: number | null;
	productImages?: ProductImage[] | null;
	variantIds?: string[] | null;
	categoryName?: string | null;
};

export type VariantPrice = {
	id: string;
	priceType: string;
	price: string | number;
	priceStartDate?: string | null;
	priceEndDate?: string | null;
	isActive?: boolean | null;
};

export type VariantItem = {
	id: string;
	sku?: string | null;
	retailPrice?: number | null;
	retailSalesPrice?: number | null;
	wholesalePrice?: number | null;
	wholesaleSalesPrice?: number | null;
	variantPrices?: VariantPrice[] | null;
	stockQuantity?: number | null;
	weightKg?: string | null;
	attributesJson?: string | null;
	product?: { name?: string | null } | null;
};

export type ProductVariant = {
	id: string;
	sku?: string | null;
	retailPrice?: number | null;
	retailSalesPrice?: number | null;
	wholesalePrice?: number | null;
	wholesaleSalesPrice?: number | null;
	stockQuantity?: number | null;
	attributesJson?: string | null;
	weightKg?: string | null;
};

export type ProductWithVariants = {
	productId: string;
	productName?: string | null;
	productDescription?: string | null;
	productImages?: ProductImage[] | null;
	variants?: ProductVariant[] | null;
};

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

export async function apiGetProductWithVariants(productId: string): Promise<ProductWithVariants | null> {
	if (!productId) return null;

	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ getProductWithVariants: ProductWithVariants }>(GET_PRODUCT_WITH_VARIANTS, {
		productId,
	});

	return result.getProductWithVariants ?? null;
}

export const fetchProductsList = apiGetProductList;
export const fetchVariantsByIds = apiGetVariantsByIds;
export const fetchProductWithVariants = apiGetProductWithVariants;
export const fetchProductCount = apiGetProductCount;
