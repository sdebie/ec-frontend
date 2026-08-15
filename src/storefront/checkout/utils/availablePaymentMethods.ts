export const IN_STORE_PAYMENT_METHOD = 'IN_STORE'

/**
 * The payment methods that make sense for the delivery the shopper chose.
 *
 * Paying at collection is only possible if there is a collection: a method that
 * needs an address is being couriered, and nobody will be at the counter to take
 * the money. The server enforces the same rule when the order is confirmed, so
 * this is what the shopper sees rather than what makes it true.
 */
export function availablePaymentMethods(methods: string[], requiresAddress: boolean): string[] {
    if (!requiresAddress) return methods
    return methods.filter((method) => method !== IN_STORE_PAYMENT_METHOD)
}
