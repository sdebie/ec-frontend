import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductImportBatchDto } from './types'

interface PriceImportBatchesResponse {
  productPriceImportBatches: ProductImportBatchDto[]
}

const PRICE_IMPORT_BATCHES = gql`
  query PriceImportBatches {
    productPriceImportBatches {
      id
      filename
      status
      importSourceType
      totalRows
      processedRows
      skippedRows
      validationErrorCount
      createdAt
      completedAt
      uploadedByUsername
      approvedByUsername
    }
  }
`

export function usePriceImportBatches() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-price-import-batches'],
    queryFn: () =>
      adminGraphqlClient.request<PriceImportBatchesResponse>(
        PRICE_IMPORT_BATCHES,
      ),
  })

  return {
    data: data ? data.productPriceImportBatches : undefined,
    isLoading,
    refetch,
  }
}
