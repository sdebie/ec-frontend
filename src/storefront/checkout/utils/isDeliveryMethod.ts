import type { ShippingMethod } from '../types'

/**
 * Determines whether a shipping method is a delivery method (requiring address).
 * A method is classified as delivery if baseFee > 0 OR estimatedDays is non-null and not "0".
 */
export function isDeliveryMethod(method: ShippingMethod): boolean {
  return method.baseFee > 0 || (method.estimatedDays !== null && method.estimatedDays !== '0')
}
