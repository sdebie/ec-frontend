import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { StoreSetting } from './types'

const SAVE_STORE_SETTINGS = gql`
  mutation SaveStoreSettings($storeSettingsDto: [StoreSettingsDtoInput!]!) {
    saveStoreSettings(storeSettingsDto: $storeSettingsDto) {
      key
      value
      description
    }
  }
`

interface SaveStoreSettingsResponse {
  saveStoreSettings: StoreSetting[]
}

/**
 * Saves multiple settings keys in one call — for a page that edits more than
 * one JSON blob at once (e.g. contact details and the footer's social links),
 * this keeps the save atomic instead of two independent `useUpdateSetting`
 * calls that could partially fail.
 */
export function useSaveStoreSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (storeSettingsDto: Array<{ key: string; value: string }>) =>
      adminGraphqlClient.request<SaveStoreSettingsResponse>(SAVE_STORE_SETTINGS, { storeSettingsDto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] })
    },
    onError: (error) => {
      const message =
        error instanceof ClientError
          ? error.response.errors?.[0]?.message ?? 'Failed to save settings'
          : 'Failed to save settings'
      toast.error(message, { duration: 0 })
    },
  })
}
