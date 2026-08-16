export interface PaginatedImages {
  images: string[]
  totalCount: number
  page: number
  pageSize: number
}

export interface ImageListParams {
  page: number
  pageSize: number
  search: string
  /** Optional subfolder scope (e.g. "brands") — ANDed with search, matched as a leading path segment. */
  directory?: string
}
