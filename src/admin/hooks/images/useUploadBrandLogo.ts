import { useMutation } from '@tanstack/react-query'
import { toast } from '@/shared/ui/components/toast'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

export function useUploadBrandLogo() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('destinationDirectory', 'brands')
      const { data } = await adminHttpClient.post<{ fileName: string }>('/admin/images/upload', formData)
      return data.fileName
    },
    onError: (error) => {
      console.error('[Images] upload brand logo failed:', error)
      toast.error('Failed to upload logo')
    },
  })
}
