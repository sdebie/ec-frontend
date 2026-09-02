export interface ShippingMethod {
    id: string | null
    name: string | null
    active: boolean | null
    baseFee: number | null
    estimatedDays: string | null
    /**
     * Whether the method needs a delivery address at checkout. Must be sent on every
     * save: the mutation maps this DTO onto the existing row, so omitting it writes
     * `false` and silently stops the storefront asking for an address.
     */
    requiresAddress: boolean | null
}
