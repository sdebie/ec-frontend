export const CustomerType = {
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
  GUEST: 'GUEST',
} as const

export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType]
