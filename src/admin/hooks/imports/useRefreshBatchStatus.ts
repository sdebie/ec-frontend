import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { BatchStatusResponse } from './types'

interface RefreshBatchStatusParams {
  endpoint: string
}

export function useRefreshBatchStatus() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ endpoint }: RefreshBatchStatusParams) => {
      const response = await adminHttpClient.get<BatchStatusResponse>(endpoint)
      return response.data
    },
  })

  return { mutateAsync, isPending }
}
