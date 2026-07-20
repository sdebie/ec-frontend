import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductComparisonDto } from './types'

interface ImportRowsResponse {
  importRows: ProductComparisonDto[]
}

const IMPORT_ROWS = gql`
  query ImportRows($batchId: String!) {
    importRows(batchId: $batchId) {
      stagedId
      sku
      validationStatus
      validationErrors
      imageErrors
      isNewProduct
      isNewVariant
      hasChanges
      currentName
      proposedName
      currentDescription
      proposedDescription
      currentStock
      proposedStock
      currentImages
      proposedImages
      currentAttributes
      proposedAttributes
    }
  }
`

export function useProductImportRows(batchId: string | undefined) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-product-import-rows', batchId],
    queryFn: () =>
      adminGraphqlClient.request<ImportRowsResponse>(IMPORT_ROWS, { batchId }),
    enabled: !!batchId,
  })

  return {
    data: data ? data.importRows : undefined,
    isLoading,
    refetch,
  }
}
