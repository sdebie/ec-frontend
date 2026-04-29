import {gql} from "graphql-request";

export const PRODUCT_PRICE_IMPORT_ROWS = gql`
	query GetProductPriceImportRows($batchId: String!) {
		getPriceImportRows(batchId: $batchId) {
			stagedId
			sku
			validationErrors
			validationStatus
            currentRetailPrice
            proposedRetailPrice

            currentWholesalePrice
            proposedWholesalePrice
			hasChanges
		}
	}
`;

export const PRODUCT_PRICE_UPLOAD_BATCHES = gql`
	query GetProductPriceUploadBatches {
		productPriceUploadBatches {
			id
			filename
			status
			totalRows
			processedRows
			skippedRows
			validationErrorCount
			createdAt
			uploadedByUsername
		}
	}
`;

