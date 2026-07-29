export const QuoteRequestStatus = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
} as const

export type QuoteRequestStatus =
  (typeof QuoteRequestStatus)[keyof typeof QuoteRequestStatus]

export const QuoteRequestStatusOptions: Record<
  QuoteRequestStatus,
  { label: string; color: string }
> = {
  [QuoteRequestStatus.NEW]: { label: 'New', color: 'blue' },
  [QuoteRequestStatus.IN_PROGRESS]: { label: 'In Progress', color: 'orange' },
  [QuoteRequestStatus.CLOSED]: { label: 'Closed', color: 'green' },
}
