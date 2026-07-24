import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/ui/components/toast'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface UploadImageParams {
  file: File
  directory: string
}

export function useUploadImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, directory }: UploadImageParams) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('destinationDirectory', directory)

      // No Content-Type header — let the browser set multipart/form-data with the correct boundary
      const { data } = await adminHttpClient.post('/admin/images/upload', formData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] })
      toast.success('Image uploaded successfully')
    },
    onError: (error) => {
      console.error('Image upload failed:', error)
      toast.error('Failed to upload image', { duration: 0 })
    },
  })
}
