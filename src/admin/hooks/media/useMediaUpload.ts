import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface ImageResponseDto {
  fileName: string
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  // No Content-Type header — let the browser set multipart/form-data with the
  // correct boundary. Hardcoding it strips the boundary, which WebKit (Safari)
  // rejects as a cancelled/network-errored request (Blink is lenient).
  const { data } = await adminHttpClient.post<ImageResponseDto>(
    '/admin/images/upload',
    formData,
  )
  return data.fileName
}

export function useMediaUpload() {
  const { mutateAsync, isPending } = useMutation({ mutationFn: uploadFile })
  return { upload: mutateAsync, isUploading: isPending }
}
