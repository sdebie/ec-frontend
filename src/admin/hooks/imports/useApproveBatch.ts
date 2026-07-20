import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface ApproveBatchParams {
  endpoint: string
}

export function useApproveBatch() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ endpoint }: ApproveBatchParams) => {
      const response = await adminHttpClient.post(endpoint)
      return response.data
    },
  })

  return { mutateAsync, isPending }
}
