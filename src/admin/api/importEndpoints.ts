/**
 * Centralized import API endpoints.
 * Maps import types to their corresponding generic REST endpoints.
 */

export type ImportType = 'product' | 'price' | 'sage'

export interface ImportEndpoints {
  upload: string
  status: (batchId: string) => string
  process: (batchId: string) => string
}

/**
 * Get endpoints for a specific import type.
 * All imports now use the same generic pattern.
 */
export function getImportEndpoints(type: ImportType): ImportEndpoints {
  return {
    upload: `/admin/imports/${type}/upload`,
    status: (batchId: string) => `/admin/imports/${type}/batches/${batchId}/status`,
    process: (batchId: string) => `/admin/imports/${type}/batches/${batchId}/process`,
  }
}

// Convenience constants for common types
export const PRODUCT_IMPORT = getImportEndpoints('product')
export const PRICE_IMPORT = getImportEndpoints('price')
export const SAGE_IMPORT = getImportEndpoints('sage')
