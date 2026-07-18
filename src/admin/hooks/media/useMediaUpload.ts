import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface ImageResponseDto {
  fileName: string
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await adminHttpClient.post<ImageResponseDto>(
    '/admin/images/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data.fileName
}

export function useMediaUpload() {
  const { mutateAsync, isPending } = useMutation({ mutationFn: uploadFile })
  return { upload: mutateAsync, isUploading: isPending }
}
