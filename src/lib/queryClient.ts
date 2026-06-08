import {QueryClient} from '@tanstack/react-query';

/**
 * Shared QueryClient instance.
 *
 * staleTime 2 min  — catalog data is read-heavy and changes slowly; avoid
 *                    redundant fetches when a component remounts.
 * gcTime   5 min  — keep unused cache entries for navigation back/forward.
 * retry    1      — one automatic retry on failure is enough for API flakiness;
 *                    further retries block the UI without user awareness.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2,
            gcTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
