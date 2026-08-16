import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { toast } from '@/shared/ui/components/toast'
import { useQuoteStore } from '../quoteStore'

export interface QuoteRequestPayload {
  name: string
  email: string
  phone?: string
  company?: string
  message?: string
  website?: string
  items: Array<{ variantId: string; quantity: number }>
}

/**
 * useSubmitQuoteRequest — REST POST hook following useSubmitEnquiry pattern.
 * POSTs to /api/storefront/quote-requests.
 * On success: returns success state + clears the quoteStore.
 * On error: toast. Logging belongs to the global handler in `queryClient.ts`, which
 * already sees every mutation error — logging here as well prints it twice.
 */
export function useSubmitQuoteRequest() {
  return useMutation({
    mutationFn: async (payload: QuoteRequestPayload) => {
      const { data } = await storefrontHttpClient.post(
        '/storefront/quote-requests',
        payload
      )
      return data
    },
    onSuccess: () => {
      useQuoteStore.getState().clear()
    },
    onError: (error) => {
      const axiosError = error as { response?: { status?: number } }
      if (axiosError.response?.status === 429) {
        toast.error('Too many attempts. Please try again later.')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    },
  })
}
