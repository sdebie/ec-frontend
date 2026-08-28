import type {ShippingMethod} from '../types'

/**
 * Whether checkout must collect a delivery address for the chosen method.
 *
 * The method states this; nothing derives it. Fee and lead time describe what a
 * method costs and how quickly it happens, not whether anything travels — a free
 * same-day collection and a free same-day delivery are identical on both.
 * Inferring from them would show the address block for in-store pickup and make
 * its fields mandatory, blocking a collection customer from checking out at all.
 *
 * No method selected yet means no address is asked for.
 */
export function requiresDeliveryAddress(method: ShippingMethod | null | undefined): boolean {
    return method?.requiresAddress ?? false
}
