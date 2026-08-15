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

export interface StoreSetting {
  key: string
  value: string
  description: string | null
}

export interface CountrySetting {
  countryCode: string
  countryName: string
  currencyCode: string
  locale: string
  decimalPlaces: number
  isDefault: boolean
  isActive: boolean
}
