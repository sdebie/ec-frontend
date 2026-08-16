import {useMutation, useQueryClient} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'

interface CleanupResponse {
    deleted: boolean
    reason?: string
}

/**
 * Deletes a library image via the safe-delete/clean-up endpoint. Unlike a fire-and-forget
 * clean-up, a gallery-initiated delete must surface a decline to the caller: a 200 response
 * with deleted:false is not an HTTP error, so nothing rejects it automatically — this hook
 * turns that outcome into a mutation error using the backend's reason, so a still-in-use
 * image reads as a failure the UI can show, not a silent no-op.
 */
export function useDeleteImage() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (filePath: string) => {
            const {data} = await adminHttpClient.delete<CleanupResponse>('/admin/images/cleanup', {
                data: {filePath},
            })
            if (!data.deleted) {
                throw new Error(data.reason ?? 'Image is still in use')
            }
            return data
        },
        onSuccess: () => {
            // Grid (infinite-query) and list (paged) views cache under different keys —
            // invalidate both, so neither goes on showing a since-deleted image.
            queryClient.invalidateQueries({queryKey: ['admin-images']})
            queryClient.invalidateQueries({queryKey: ['admin-images-page']})
        },
    })
}
