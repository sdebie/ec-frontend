import {gql} from "graphql-request";

export const PRODUCT_IMPORT_ROWS = gql`
	query GetImportRows($batchId: String!) {
		importRows(batchId: $batchId) {
			stagedId
			sku
			categorySlug
			brandSlug
			proposedStock
			currentStock
			proposedImages
			currentImages
			proposedAttributes
			currentAttributes
			validationErrors
			validationStatus
			imageErrors
			currentName
			proposedName
			currentDescription
			proposedDescription
			currentShortDescription
			proposedShortDescription
			isValidCategory
			isValidBrand
			isNewProduct
			isNewVariant
			hasChanges
		}
	}
`;

export const PRODUCT_UPLOAD_BATCHES = gql`
	query GetProductUploadBatches {
		productUploadBatches {
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

