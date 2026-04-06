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

export type ProductInfo = {
	id: string;
	slug?: string | null;
	name?: string | null;
	description?: string | null;
	short_description?: string | null;
	product_type?: string | null;
	date_created?: string | null;
	category_is?: string | null;
	brand_id?: string | null;
};

export type ProductInformation = {
	productInfo: ProductInfo;
	variants?: ProductVariant[] | null;
	images?: ProductImage[] | null;
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

