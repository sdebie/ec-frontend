import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/ui/components/toast'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

interface BulkUploadProgress {
  currentBatch: number
  totalBatches: number
}

interface BulkUploadResult {
  uploaded: number
  skipped: number
}

export function useBulkUpload() {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<BulkUploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const upload = useCallback(async (files: File[], directory: string): Promise<BulkUploadResult> => {
    const batchSize = 20
    const totalBatches = Math.ceil(files.length / batchSize)
    let uploaded = 0
    let skipped = 0

    setIsUploading(true)
    setProgress({ currentBatch: 0, totalBatches })

    try {
      for (let i = 0; i < totalBatches; i++) {
        const batch = files.slice(i * batchSize, (i + 1) * batchSize)
        const formData = new FormData()

        batch.forEach((file) => {
          formData.append('images', file)
        })
        formData.append('destinationDirectory', directory)

        setProgress({ currentBatch: i + 1, totalBatches })

        try {
          const { data } = await adminHttpClient.post<{ uploaded: number; skipped: number }>(
            '/admin/images/bulk-upload',
            formData,
            { timeout: 0 } // No timeout — bulk uploads can be large; global 60s timeout is too short
          )

          uploaded += data.uploaded
          skipped += data.skipped
        } catch (err) {
          console.error(`Bulk image upload failed — batch ${i + 1} of ${totalBatches}:`, err)
          toast.error(`Batch ${i + 1} of ${totalBatches} failed — continuing`, { duration: 5000 })
        }
      }

      if (uploaded > 0) {
        queryClient.invalidateQueries({ queryKey: ['admin-images'] })
      }

      return { uploaded, skipped }
    } finally {
      setIsUploading(false)
    }
  }, [queryClient])

  return { upload, progress, isUploading }
}
