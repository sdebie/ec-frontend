import {useQuery} from '@tanstack/react-query'
import {adminHttpClient} from '@/shared/api/http/adminHttpClient'

export function useImageDirectories() {
    return useQuery<string[]>({
        queryKey: ['admin-image-directories'],
        queryFn: async () => {
            const {data} = await adminHttpClient.get<string[]>('/admin/images/directories')
            return data
        },
    })
}
