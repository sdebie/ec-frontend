import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductUploadBatchDto } from './types'

interface PriceUploadBatchesResponse {
  productPriceUploadBatches: ProductUploadBatchDto[]
}

const PRICE_UPLOAD_BATCHES = gql`
  query PriceUploadBatches {
    productPriceUploadBatches {
      id
      filename
      status
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

export function usePriceUploadBatches() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-price-upload-batches'],
    queryFn: () =>
      adminGraphqlClient.request<PriceUploadBatchesResponse>(
        PRICE_UPLOAD_BATCHES,
      ),
  })

  return {
    data: data ? data.productPriceUploadBatches : undefined,
    isLoading,
    refetch,
  }
}
