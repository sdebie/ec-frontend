export const ProductStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
} as const

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]

export const ProductStatusOptions: Record<ProductStatus, { label: string; color: string }> = {
  [ProductStatus.PENDING]: { label: 'Pending', color: 'yellow' },
  [ProductStatus.ACTIVE]: { label: 'Active', color: 'green' },
  [ProductStatus.DISABLED]: { label: 'Disabled', color: 'red' },
}
