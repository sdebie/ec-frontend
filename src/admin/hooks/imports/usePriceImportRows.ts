import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductPriceComparisonDto } from './types'

interface PriceImportRowsResponse {
  getPriceImportRows: ProductPriceComparisonDto[]
}

const GET_PRICE_IMPORT_ROWS = gql`
  query GetPriceImportRows($batchId: String!) {
    getPriceImportRows(batchId: $batchId) {
      stagedId
      sku
      validationStatus
      validationErrors
      hasChanges
      currentRetailPrice
      proposedRetailPrice
      currentWholesalePrice
      proposedWholesalePrice
    }
  }
`

export function usePriceImportRows(batchId: string | undefined) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-price-import-rows', batchId],
    queryFn: () =>
      adminGraphqlClient.request<PriceImportRowsResponse>(
        GET_PRICE_IMPORT_ROWS,
        { batchId },
      ),
    enabled: !!batchId,
  })

  return {
    data: data ? data.getPriceImportRows : undefined,
    isLoading,
    refetch,
  }
}
