import type { CustomerType } from '@/shared/auth/customerAuthStore'

export function mapShopperType(shopperType: string | null | undefined): CustomerType {
  if (shopperType === 'WHOLESALER') return 'WHOLESALE'
  if (shopperType === 'RETAILER') return 'RETAIL'
  return 'GUEST'
}
