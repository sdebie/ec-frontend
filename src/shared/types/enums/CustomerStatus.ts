export const CustomerStatus = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
  PENDING: 'PENDING',
} as const

export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus]
