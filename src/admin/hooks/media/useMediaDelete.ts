import { useMutation } from '@tanstack/react-query'
import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

async function deleteMedia(imageUrl: string): Promise<void> {
  const id = imageUrl.split('/').pop()
  await adminHttpClient.delete(`/admin/media/${id}`)
}

export function useMediaDelete() {
  const { mutateAsync, isPending } = useMutation({ mutationFn: deleteMedia })
  return { remove: mutateAsync, isDeleting: isPending }
}
