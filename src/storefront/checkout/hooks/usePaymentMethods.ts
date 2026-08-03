import {useQuery} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'

export function usePaymentMethods() {
    return useQuery({
        queryKey: ['checkout', 'payment-methods'],
        queryFn: async () => {
            const {data} = await storefrontHttpClient.get<string[]>(
                '/storefront/payment-methods'
            )
            return data
        },
        staleTime: 5 * 60 * 1000,
    })
}
