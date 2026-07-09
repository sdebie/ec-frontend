export const ProductType = {
  VARIABLE: 'VARIABLE',
  SIMPLE: 'SIMPLE',
} as const

export type ProductType = (typeof ProductType)[keyof typeof ProductType]
