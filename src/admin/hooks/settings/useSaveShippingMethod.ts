import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError, gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ShippingMethod } from './types'

const SAVE_SHIPPING_METHOD = gql`
  mutation SaveShippingMethod($methodDto: ShippingMethodDtoInput!) {
    saveShippingMethod(methodDto: $methodDto) {
      id
      name
      isActive: active
      baseFee
      estimatedDays
    }
  }
`

interface SaveShippingMethodResponse {
  saveShippingMethod: ShippingMethod
}

export function useSaveShippingMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (methodDto: ShippingMethod) =>
      adminGraphqlClient.request<SaveShippingMethodResponse>(SAVE_SHIPPING_METHOD, { methodDto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-methods'] })
    },
    onError: (error) => {
      const message =
        error instanceof ClientError
          ? error.response.errors?.[0]?.message ?? 'Failed to save shipping method'
          : 'Failed to save shipping method'
      toast.error(message, { duration: 0 })
    },
  })
}
