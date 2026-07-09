import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface UploadResponse {
  url: string
  id: string
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await adminHttpClient.post<UploadResponse>(
    '/admin/media/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.url
}

export function useMediaUpload() {
  const { mutateAsync, isPending } = useMutation({ mutationFn: uploadFile })
  return { upload: mutateAsync, isUploading: isPending }
}
