// --- Enums ---

export type BatchStatus = 'IMPORTING' | 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
export type ValidationStatus = 'VALID' | 'INVALID'

// --- Batch List DTOs ---

export interface ProductUploadBatchDto {
  id: string
  filename: string
  status: BatchStatus
  totalRows: number
  processedRows: number
  skippedRows: number
  validationErrorCount: number
  createdAt: string
  completedAt: string | null
  uploadedByUsername: string
  approvedByUsername: string | null
}

// --- Review DTOs ---

export interface ProductComparisonDto {
  stagedId: string
  /** Raw CSV cell; rows with a missing sku are still staged (with a validation error). */
  sku: string | null
  validationStatus: ValidationStatus
  /** Backend joins errors with '; ' (ProductImportValidator); null when the row is valid. */
  validationErrors: string | null
  /** Single message, e.g. "Missing Images: a.jpg, b.jpg"; null when all images exist. */
  imageErrors: string | null
  newProduct: boolean
  newVariant: boolean
  hasChanges: boolean
  currentName: string | null
  proposedName: string | null
  currentDescription: string | null
  proposedDescription: string | null
  currentStock: number | null
  /** Null when the CSV stock value is missing or unparseable. */
  proposedStock: number | null
  /** Comma-joined image filenames (','); null when the variant is new or has no images. */
  currentImages: string | null
  /** Raw comma-separated CSV cell; null when the column is absent or blank. */
  proposedImages: string | null
  /** Raw attributes JSON string from the existing variant; null when the variant is new. */
  currentAttributes: string | null
  /** Raw attributes JSON string from the CSV cell; null when absent. */
  proposedAttributes: string | null
}

export interface ProductPriceComparisonDto {
  stagedId: string
  sku: string
  validationStatus: ValidationStatus
  /** Backend joins errors with '; ' (ProductPriceImportValidator); null when the row is valid. */
  validationErrors: string | null
  hasChanges: boolean
  currentRetailPrice: number | null
  proposedRetailPrice: number
  currentWholesalePrice: number | null
  proposedWholesalePrice: number | null
}

// --- Batch Status Response (REST polling) ---

export interface BatchStatusResponse {
  batchId: string
  status: BatchStatus
  totalRows: number
  processedRows: number
  skippedRows: number
  validationErrorCount: number
}

// --- Utility types ---

export type ChangeType = 'New Product' | 'New Variant' | 'Update' | 'No Change'

export type PriceChangeIndicator = 'Changed' | 'No Change'
