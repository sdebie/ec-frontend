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
      const formData = new FormData()
      formData.append('file', file)
      const response = await adminHttpClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
  })

  return { mutateAsync, isPending }
}
