import { useMutation } from '@tanstack/react-query'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

export interface EnquiryPayload {
  name: string
  email: string
  phone: string
  company?: string
  message: string
  website?: string
}

export function useSubmitEnquiry() {
  return useMutation({
    mutationFn: async (payload: EnquiryPayload) => {
      const { data } = await storefrontHttpClient.post(
        '/storefront/enquiries',
        payload
      )
      return data
    },
    onError: () => {
    },
  })
}
