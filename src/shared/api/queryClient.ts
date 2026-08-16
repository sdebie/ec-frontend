import {QueryClient, QueryCache, MutationCache} from '@tanstack/react-query'

/**
 * Every query and mutation error is logged here, once, and only while developing.
 *
 * Dev-gated because these payloads are the raw server error — a production bundle
 * has no reason to print them to a shopper's console. ⚠️ The gate is only as good
 * as the build: `import.meta.env.DEV` is TRUE when the app is served by the Vite
 * dev server, so this strips nothing until the production image stops doing that.
 *
 * This is also the ONLY place mutation errors are logged. A hook's `onError` is for
 * user-facing handling — toasts, field errors, state resets — never for logging;
 * both handlers fire, so a `console.error` there prints the same error twice.
 */
const logQueryError = (scope: 'query' | 'mutation') => (error: unknown) => {
    if (import.meta.env.DEV) {
        console.error(`[QueryClient] ${scope} error:`, error)
    }
}

export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: logQueryError('query'),
    }),
    mutationCache: new MutationCache({
        onError: logQueryError('mutation'),
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
