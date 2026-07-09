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
  sku: string
  validationStatus: ValidationStatus
  validationErrors: string[]
  imageErrors: string[]
  isNewProduct: boolean
  isNewVariant: boolean
  hasChanges: boolean
  currentName: string | null
  proposedName: string
  currentDescription: string | null
  proposedDescription: string
  currentStock: number | null
  proposedStock: number
  currentImages: string[]
  proposedImages: string[]
  currentAttributes: Record<string, string> | null
  proposedAttributes: Record<string, string>
}

export interface ProductPriceComparisonDto {
  stagedId: string
  sku: string
  validationStatus: ValidationStatus
  validationErrors: string[]
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
