import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductImportBatchDto } from './types'

interface ProductImportBatchesResponse {
  productImportBatches: ProductImportBatchDto[]
}

const PRODUCT_IMPORT_BATCHES = gql`
  query ProductImportBatches {
    productImportBatches {
      id
      filename
      status
      importSourceType
      totalRows
      processedRows
      skippedRows
      validationErrorCount
      createdAt
      uploadedByUsername
    }
  }
`

export function useProductImportBatches() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-product-import-batches'],
    queryFn: () =>
      adminGraphqlClient.request<ProductImportBatchesResponse>(
        PRODUCT_IMPORT_BATCHES,
      ),
  })

  return {
    data: data ? data.productImportBatches : undefined,
    isLoading,
    refetch,
  }
}
