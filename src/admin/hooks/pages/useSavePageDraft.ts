import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import { toast } from '@/shared/ui/components/toast'

interface SavePageDraftParams {
  id: string
  content: string
  silent?: boolean
}

export function useSavePageDraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, content }: SavePageDraftParams) => {
      await adminHttpClient.put(`/admin/pages/${id}`, { content })
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] })
      if (!variables.silent) {
        toast.success('Draft saved')
      }
    },
    onError: (error) => {
      console.error('[PageContent] save draft failed:', error)
      toast.error('Failed to save draft')
    },
  })
}
