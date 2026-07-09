import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductUploadBatchDto } from './types'

interface ProductUploadBatchesResponse {
  productUploadBatches: ProductUploadBatchDto[]
}

const PRODUCT_UPLOAD_BATCHES = gql`
  query ProductUploadBatches {
    productUploadBatches {
      id
      filename
      status
      totalRows
      processedRows
      skippedRows
      validationErrorCount
      createdAt
      uploadedByUsername
    }
  }
`

export function useProductUploadBatches() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-product-upload-batches'],
    queryFn: () =>
      adminGraphqlClient.request<ProductUploadBatchesResponse>(
        PRODUCT_UPLOAD_BATCHES,
      ),
  })

  return {
    data: data ? data.productUploadBatches : undefined,
    isLoading,
    refetch,
  }
}
