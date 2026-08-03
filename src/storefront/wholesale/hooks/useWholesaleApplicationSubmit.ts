import {useMutation} from '@tanstack/react-query'
import {ClientError, gql} from 'graphql-request'
import {toast} from '@/shared/ui/components/toast'

import {graphqlClient} from '@/shared/api/graphql/graphqlClient'
import type {WholesaleCustomerDtoInput} from '../types'

const CREATE_WHOLESALE_APPLICATION = gql`
    mutation CreateWholesaleApplication($customer: WholesaleCustomerDtoInput!) {
        createWholesaleApplication(customer: $customer) {
            id
            email
            status
        }
    }
`

export function useWholesaleApplicationSubmit() {
    return useMutation({
        mutationFn: (input: WholesaleCustomerDtoInput) =>
            graphqlClient.request(CREATE_WHOLESALE_APPLICATION, {customer: input}),
        onError: (error) => {
            console.error('[WholesaleApplication] submit failed:', error)
            const message = error instanceof ClientError ? error.response.errors?.[0]?.message ?? 'Failed to submit application' : 'Failed to submit application'
            toast.error(message, {duration: 0})
        },
    })
}
