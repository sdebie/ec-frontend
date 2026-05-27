import {
	PRODUCT_PRICE_IMPORT_ROWS,
	PRODUCT_PRICE_UPLOAD_BATCHES,
} from "@/services/graphql/admin/product/productPriceImport.queries.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {ProductPriceUploadStaged, ProductUploadBatch} from "@/types/admin/ProductTypes.ts";
import getServiceEndpoint from "@/utils/HostnameResolver.ts";

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetProductPriceImportRows(batchId: string): Promise<ProductPriceUploadStaged[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ getPriceImportRows: ProductPriceUploadStaged[] }>(PRODUCT_PRICE_IMPORT_ROWS, {
		batchId,
	});

	return result.getPriceImportRows ?? [];
}

export async function apiGetProductPriceUploadBatches(): Promise<ProductUploadBatch[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ productPriceUploadBatches: ProductUploadBatch[] }>(PRODUCT_PRICE_UPLOAD_BATCHES);

	return result.productPriceUploadBatches ?? [];
}

