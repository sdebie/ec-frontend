import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

/**
 * Hook to trigger a Sage price import.
 * Unlike CSV imports, no file is needed - Sage API is queried directly.
 */
export function useSageImport() {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const response = await adminHttpClient.post('/admin/imports/sage/upload')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sage-import-batches', 'admin-price-import-batches'] })
    },
    onError: () => {
    },
  })

  return { mutateAsync, isPending }
}
