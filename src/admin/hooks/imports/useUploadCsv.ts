import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface UploadCsvParams {
  file: File
  endpoint: string
}

export function useUploadCsv() {
  const queryClient = useQueryClient()

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ file, endpoint }: UploadCsvParams) => {
      // Read the file into memory before posting. Safari streams disk-backed
      // Files during upload and aborts with a bare "Network Error" if the file
      // is an iCloud placeholder or was modified after selection; buffering
      // makes the upload independent of the file's on-disk state.
      const buffered = new File([await file.arrayBuffer()], file.name, { type: file.type })
      const formData = new FormData()
      formData.append('file', buffered)
      const response = await adminHttpClient.post(endpoint, formData, {
        // Let the browser set the multipart boundary. CSV uploads can take
        // longer than the shared HTTP client's 60-second request timeout.
        timeout: 0,
      })
      return response.data
    },
    onSuccess: (_data, { endpoint }) => {
      if (endpoint.includes('price/upload-csv')) {
        queryClient.invalidateQueries({ queryKey: ['admin-price-upload-batches'] })
      } else if (endpoint.includes('products/upload-csv')) {
        queryClient.invalidateQueries({ queryKey: ['admin-product-upload-batches'] })
      }
    },
    onError: (error) => {
      console.error('[ProductImport] CSV upload failed:', error)
    },
  })

  return { mutateAsync, isPending }
}
