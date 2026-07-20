import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { StoreSetting } from './types'

const STORE_SETTINGS = gql`
  query StoreSettings {
    storeSettings {
      key
      value
      description
    }
  }
`

interface StoreSettingsResponse {
  storeSettings: StoreSetting[]
}

export function useStoreSettings() {
  return useQuery({
    queryKey: ['admin-store-settings'],
    queryFn: () => adminGraphqlClient.request<StoreSettingsResponse>(STORE_SETTINGS),
    select: (data) => data.storeSettings,
  })
}
