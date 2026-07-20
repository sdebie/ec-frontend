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
}
