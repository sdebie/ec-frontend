import {QueryClient, QueryCache, MutationCache} from '@tanstack/react-query'

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => console.error('[QueryClient] query error:', error),
    }),
    mutationCache: new MutationCache({
        onError: (error) => console.error('[QueryClient] mutation error:', error),
    }),
    defaultOptions: {
        queries: {
            staleTime: 2 * 60 * 1000,   // 2 minutes — catalog data is read-heavy
            gcTime: 5 * 60 * 1000,   // 5 minutes — keep cache during navigation
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})
