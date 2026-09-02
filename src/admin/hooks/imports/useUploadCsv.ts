import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'
import type { ImportType } from '@/admin/api/importEndpoints'

interface UploadCsvParams {
  file: File
  endpoint: string
  importType?: ImportType
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
    onSuccess: (_data, { endpoint, importType }) => {
      // Invalidate both old and new endpoints for backwards compatibility
      if (endpoint.includes('price')) {
        queryClient.invalidateQueries({ queryKey: ['admin-price-import-batches'] })
      } else if (endpoint.includes('product')) {
        queryClient.invalidateQueries({ queryKey: ['admin-product-import-batches'] })
      }

      // Also invalidate by import type if provided
      if (importType) {
        queryClient.invalidateQueries({ queryKey: [`admin-${importType}-import-batches`] })
      }
    },
    onError: () => {
    },
  })

  return { mutateAsync, isPending }
}
