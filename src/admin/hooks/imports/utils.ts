import type { BatchStatus, ValidationStatus, ChangeType, PriceChangeIndicator, ProductComparisonDto, ProductPriceComparisonDto } from './types'

/**
 * Maps a BatchStatus to a StatusBadge color value.
 */
export function getBatchStatusColor(status: BatchStatus): string {
  switch (status) {
    case 'IMPORTING':
    case 'PENDING':
    case 'PROCESSING':
      return 'yellow'
    case 'PROCESSED':
      return 'green'
    case 'FAILED':
      return 'red'
  }
}

/**
 * Maps a ValidationStatus to a StatusBadge color value.
 */
export function getValidationStatusColor(status: ValidationStatus): string {
  return status === 'VALID' ? 'green' : 'red'
}

/**
 * Derives the change type label for a product staged row.
 */
export function deriveChangeType(row: ProductComparisonDto): ChangeType {
  if (row.isNewProduct) return 'New Product'
  if (row.isNewVariant) return 'New Variant'
  if (row.hasChanges) return 'Update'
  return 'No Change'
}

/**
 * Derives the change indicator for a price staged row.
 */
export function derivePriceChangeIndicator(row: ProductPriceComparisonDto): PriceChangeIndicator {
  return row.hasChanges ? 'Changed' : 'No Change'
}

/**
 * Derives canMutate from a role string. Extracted as a pure function so it can be property-tested.
 */
export function deriveCanMutate(role: string | null): boolean {
  return role === 'SUPER_ADMIN'
}

/**
 * Computes summary statistics from an array of ProductComparisonDto rows.
 */
export function computeProductReviewSummary(rows: ProductComparisonDto[]) {
  return {
    total: rows.length,
    valid: rows.filter(r => r.validationStatus === 'VALID').length,
    withErrors: rows.filter(r => r.validationStatus === 'INVALID').length,
    newProducts: rows.filter(r => r.isNewProduct).length,
    updates: rows.filter(r => r.hasChanges && !r.isNewProduct && !r.isNewVariant).length,
  }
}
