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
