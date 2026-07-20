import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import { toast } from '@/shared/ui/components/toast'

export function usePublishPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await adminHttpClient.post(`/admin/pages/${id}/publish`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] })
      toast.success('Policy published')
    },
    onError: (error) => {
      console.error('[PageContent] publish failed:', error)
      toast.error('Failed to publish page')
    },
  })
}
