import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

/**
 * Hook to trigger a Sage item import.
 * Fetches items (SKU, name, description) from Sage API.
 * Unlike CSV imports, no file is needed - Sage API is queried directly.
 */
export function useSageItemImport() {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const response = await adminHttpClient.post('/admin/imports/sage-items/upload')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sage-item-import-batches', 'admin-product-import-batches'] })
    },
    onError: () => {
    },
  })

  return { mutateAsync, isPending }
}
