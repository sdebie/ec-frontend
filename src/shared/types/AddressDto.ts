export interface AddressDto {
  line1: string
  line2: string | null
  suburb: string | null
  city: string
  province: string
  postalCode: string
}

/**
 * Write-side counterpart: every field independently nullable, since the backend
 * treats a null field as "leave unchanged" (partial update) rather than "blank it
 * out" — never send '' for an intentionally-unset field, only null.
 */
export interface AddressInput {
  line1?: string | null
  line2?: string | null
  suburb?: string | null
  city?: string | null
  province?: string | null
  postalCode?: string | null
}
