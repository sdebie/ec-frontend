export interface ShippingMethod {
  id: string | null
  name: string | null
  active: boolean | null
  baseFee: number | null
  estimatedDays: string | null
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
