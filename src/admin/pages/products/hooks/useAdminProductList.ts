import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { AdminProductListItem } from '../types'

export interface UseAdminProductListParams {
  pageIndex: number
  pageSize: number
  status?: string
  categoryId?: string
  brandId?: string
  search?: string
}

interface AdminProductListResponse {
  adminProductList: {
    content: AdminProductListItem[]
    totalElements: number
    totalPages: number
    pageIndex: number
    pageSize: number
  }
}

const ADMIN_PRODUCT_LIST = gql`
  query AdminProductList(
    $pageIndex: Int!
    $pageSize: Int!
    $status: String
    $categoryId: String
    $brandId: String
    $search: String
  ) {
    adminProductList(
      pageIndex: $pageIndex
      pageSize: $pageSize
      status: $status
      categoryId: $categoryId
      brandId: $brandId
      search: $search
    ) {
      content {
        id
        name
        slug
        sku
        category {
          id
          name
        }
        status
        thumbnailUrl
        retailPrice
        stockCount
        stockLevel
      }
      totalElements
      totalPages
      pageIndex
      pageSize
    }
  }
`

export function buildVariables(params: UseAdminProductListParams) {
  const variables: Record<string, unknown> = {
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
  }

  if (params.status && params.status !== 'ALL') {
    variables.status = params.status
  }

  if (params.categoryId && params.categoryId !== 'ALL') {
    variables.categoryId = params.categoryId
  }

  if (params.brandId && params.brandId !== 'ALL') {
    variables.brandId = params.brandId
  }

  if (params.search && params.search.trim() !== '') {
    variables.search = params.search.trim()
  }

  return variables
}

export function useAdminProductList(params: UseAdminProductListParams) {
  const { pageIndex, pageSize, status, categoryId, brandId, search } = params

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'admin-products-list',
      pageIndex,
      pageSize,
      status,
      categoryId,
      brandId,
      search,
    ],
    queryFn: () =>
      adminGraphqlClient.request<AdminProductListResponse>(
        ADMIN_PRODUCT_LIST,
        buildVariables(params),
      ),
  })

  return {
    data: data
      ? {
          content: data.adminProductList.content,
          totalElements: data.adminProductList.totalElements,
          totalPages: data.adminProductList.totalPages,
        }
      : undefined,
    isLoading,
    refetch,
  }
}
