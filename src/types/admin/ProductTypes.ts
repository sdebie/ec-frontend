import {ProductImportValidationStatus} from "@/constants/enums/ProductImportValidationStatus.ts";

export type {
    ProductImage,
    ProductListItem,
    ProductShoppingListItem,
    VariantPrice,
    VariantItem,
    ProductVariant,
    ProductInformation,
} from '@/types/shared/ProductTypes.ts';

export type ProductUploadStaged = {
	stagedId: string;
	sku: string;
	categorySlug?: string | null;
	brandSlug?: string | null;
	proposedStock?: number | null;
	currentStock?: number | null;
	proposedImages?: string | null;
	currentImages?: string | null;
	proposedAttributes?: string | null;
	currentAttributes?: string | null;
	validationErrors?: string | null;
	validationStatus?: ProductImportValidationStatus | null;
	imageErrors?: string | null;
	currentName: string;
	proposedName: string;
	currentDescription: string;
	proposedDescription: string;
	currentShortDescription: string;
	proposedShortDescription: string;
	isValidCategory?: boolean | null;
	isValidBrand?: boolean | null;
	isNewProduct?: boolean | null;
	isNewVariant?: boolean | null;
	hasChanges?: boolean | null;
};

export type ProductPriceUploadStaged = {
	stagedId: string;
	sku: string;
	validationErrors?: string | null;
	validationStatus?: ProductImportValidationStatus | null;
	currentRetailPrice?: number | null;
	proposedRetailPrice?: number | null;
	currentWholesalePrice?: number | null;
	proposedWholesalePrice?: number | null;
	hasChanges?: boolean | null;
};

export type ProductUploadBatch = {
	id: string;
	filename: string;
	status: string;
	totalRows: number;
	createdAt: string;
	uploadedByUsername: string | null;
	stagedRows?: number | null;
	processedRows?: number | null;
	skippedRows?: number | null;
	validationErrorCount?: number | null;
	completed?: boolean | null;
};

export type ProductUploadBatchProcessStatus = {
	batchId: string;
	status: string;
	totalRows: number;
	stagedRows: number;
	processedRows: number;
	skippedRows: number;
	validationErrorCount?: number | null;
	completed: boolean;
};
