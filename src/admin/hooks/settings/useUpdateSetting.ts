import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { StoreSetting } from './types'

const UPDATE_SETTING = gql`
  mutation UpdateSetting($key: String!, $value: String!) {
    updateSetting(key: $key, value: $value) {
      key
      value
      description
    }
  }
`

interface UpdateSettingResponse {
  updateSetting: StoreSetting
}

export function useUpdateSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminGraphqlClient.request<UpdateSettingResponse>(UPDATE_SETTING, { key, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] })
    },
    onError: (error) => {
      console.error('[Settings] update setting failed:', error)
      const message =
        error instanceof ClientError
          ? error.response.errors?.[0]?.message ?? 'Failed to update setting'
          : 'Failed to update setting'
      toast.error(message, { duration: 0 })
    },
  })
}
