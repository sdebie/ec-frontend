import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

/**
 * Cleanup an abandoned uploaded file via the path-safe cleanup endpoint.
 * Only deletes the file if no ProductImageEntity references it.
 */
async function cleanupFile(filePath: string): Promise<void> {
  await adminHttpClient.delete('/admin/images/cleanup', {
    data: { filePath },
  })
}

export function useMediaDelete() {
  const { mutateAsync, isPending } = useMutation({ mutationFn: cleanupFile })
  return { remove: mutateAsync, isDeleting: isPending }
}
