import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

export interface UseOnSaleProductsParams {
  pageIndex: number
  pageSize: number
}

export interface OnSaleProductImage {
  id: string
  imageUrl: string
  featured: boolean
  sortOrder: number
}

export interface OnSaleProductPrice {
  price: number
}

export interface OnSaleProductItem {
  id: string
  name: string
  slug: string
  images: OnSaleProductImage[]
  retailPrice: OnSaleProductPrice | null
  retailSalePrice: OnSaleProductPrice | null
}

interface SaleProductListResponse {
  saleProductList: {
    content: OnSaleProductItem[]
    totalElements: number
    totalPages: number
  }
}

const SALE_PRODUCT_LIST = gql`
  query SaleProductList($pageRequest: PageRequestInput, $ignoreStatus: Boolean) {
    saleProductList(pageRequest: $pageRequest, ignoreStatus: $ignoreStatus) {
      content {
        id
        name
        slug
        images {
          id
          imageUrl
          featured
          sortOrder
        }
        retailPrice {
          price
        }
        retailSalePrice {
          price
        }
      }
      totalElements
      totalPages
    }
  }
`

export function useOnSaleProducts(params: UseOnSaleProductsParams) {
  const { pageIndex, pageSize } = params

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-on-sale-products', pageIndex, pageSize],
    queryFn: () =>
      adminGraphqlClient.request<SaleProductListResponse>(SALE_PRODUCT_LIST, {
        pageRequest: { pageIndex, pageSize },
        ignoreStatus: true,
      }),
  })

  return {
    data: data
      ? {
          content: data.saleProductList.content,
          totalElements: data.saleProductList.totalElements,
          totalPages: data.saleProductList.totalPages,
        }
      : undefined,
    isLoading,
    refetch,
  }
}
