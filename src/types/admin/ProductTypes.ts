import {ProductImportValidationStatus} from "@/constants/enums/ProductImportValidationStatus.ts";

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
	imageName?: string | null;
	variantIds?: string[] | null;
	categoryName?: string | null;
	brandName?: string | null;
};

export type ProductShoppingListItem = {
	id: string;
	name: string;
	shortDescription?: string | null;
	variantCount?: number | null;
	images?: ProductImage[] | null;
	retailPrice?: VariantPrice | null;
	wholesalePrice?: VariantPrice | null;
	retailSalePrice?: VariantPrice | null;
	wholesaleSalePrice?: VariantPrice | null;
};

export type SalesProductListItem = {
	product?: {
		id: string;
		slug?: string | null;
		name?: string | null;
		description?: string | null;
		shortDescription?: string | null;
		productType?: string | null;
		createdAt?: string | null;
		category?: { id: string; name?: string | null; slug?: string | null } | null;
		brand?: { id: string; name?: string | null; slug?: string | null } | null;
	} | null;
	variants?: ProductVariant[] | null;
};


export type VariantPrice = {
	id: string;
	priceType?: string | null;
	price?: number | null;
	priceStartDate?: string | null;
	priceEndDate?: string | null;
	isActive?: boolean | null;
	saleDaysRemaining?: number | null;
};

export type VariantItem = {
	id: string;
	sku?: string | null;
	retailPrice?: number | null;
	retailSalesPrice?: number | null;
	wholesalePrice?: number | null;
	wholesaleSalesPrice?: number | null;
	stockQuantity?: number | null;
	weightKg?: string | null;
	attributesJson?: string | null;
	product?: { name?: string | null } | null;
};

export type ProductVariant = {
	id: string;
	sku?: string | null;
	stockQuantity?: number | null;
	attributesJson?: string | null;
	weightKg?: string | null;
	prices?: VariantPrice[] | null;
	images?: ProductImage[] | null;
};

export type ProductInformation = {
	product?: {
		id: string;
		slug?: string | null;
		name?: string | null;
		description?: string | null;
		shortDescription?: string | null;
		productType?: string | null;
		createdAt?: string | null;
		category?: { id: string; name?: string | null; slug?: string | null } | null;
		brand?: { id: string; name?: string | null; slug?: string | null } | null;
	} | null;
	variants?: ProductVariant[] | null;
};

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
	currentRetailPrice?: number | null;
	proposedRetailPrice?: number | null;
	currentWholesalePrice?: number | null;
	proposedWholesalePrice?: number | null;
	currentRetailSalePrice?: number | null;
	proposedRetailSalePrice?: number | null;
	currentWholesaleSalePrice?: number | null;
	proposedWholesaleSalePrice?: number | null;
	isValidCategory?: boolean | null;
	isValidBrand?: boolean | null;
	isNewProduct?: boolean | null;
	isNewVariant?: boolean | null;
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
