import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

export function useTestSageConnection() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const response = await adminHttpClient.get('/admin/sage', {
        params: { type: 'Item/Get' },
      })
      return response.data
    },
  })

  return { mutateAsync, isPending }
}
