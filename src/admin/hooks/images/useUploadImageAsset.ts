import { useMutation } from '@tanstack/react-query'
import { toast } from '@/shared/ui/components/toast'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

/**
 * Uploads one image into `directory` and resolves to the stored
 * storage-relative filename — the shape a single-image form field persists.
 * Callers scope the directory to their own entity (brands, categories, …) so
 * each picker browses only its own images rather than the whole library.
 *
 * Distinct from useUploadImage, which resolves to the raw response and toasts
 * on success; a form field wants the filename and only surfaces failures.
 */
export function useUploadImageAsset(directory: string) {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('destinationDirectory', directory)
      const { data } = await adminHttpClient.post<{ fileName: string }>('/admin/images/upload', formData)
      return data.fileName
    },
    onError: (error) => {
      console.error('[Images] upload image asset failed:', error)
      toast.error('Failed to upload image')
    },
  })
}
