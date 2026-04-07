import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {ProductUploadBatch, ProductUploadStaged} from "@/types/admin/ProductTypes.ts";
import {
	PRODUCT_IMPORT_ROWS,
	PRODUCT_UPLOAD_BATCHES,
} from "@/services/graphql/admin/product/productImport.queries.ts";

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetProductImportRows(batchId: string): Promise<ProductUploadStaged[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ importRows: ProductUploadStaged[] }>(PRODUCT_IMPORT_ROWS, {
		batchId,
	});

	return result.importRows ?? [];
}

export async function apiGetProductUploadBatches(): Promise<ProductUploadBatch[]> {
	const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

	const result = await client.request<{ productUploadBatches: ProductUploadBatch[] }>(PRODUCT_UPLOAD_BATCHES);

	return result.productUploadBatches ?? [];
}

